from azure.cosmos import CosmosClient, exceptions
import azure.functions as func
import os, json, uuid, logging
from datetime import datetime, timezone, timedelta

app = func.FunctionApp()

COSMOS_CONN = os.environ.get("CosmosDBConnection")
cosmos_client = CosmosClient.from_connection_string(COSMOS_CONN) if COSMOS_CONN else None

def get_container():
    if not cosmos_client:
        raise Exception("CosmosDBConnection not configured")
    return cosmos_client.get_database_client("FitnessDB").get_container_client("Activities")


# ---------- POST /log-activity ----------
@app.function_name(name="log_activity")
@app.route(route="log-activity", methods=["POST"], auth_level=func.AuthLevel.ANONYMOUS)
def log_activity(req: func.HttpRequest) -> func.HttpResponse:
    try:
        body = req.get_json()
    except ValueError:
        return func.HttpResponse("Invalid JSON", status_code=400)

    # ---- Validation ----
    user_id = body.get("userId")
    activity_type = body.get("type")
    duration = body.get("durationMinutes")

    if not user_id or not activity_type or duration is None:
        return func.HttpResponse("Missing required fields", status_code=400)
    if not isinstance(duration, int) or duration <= 0:
        return func.HttpResponse("Duration must be a positive integer", status_code=400)

    # ---- Calories Calculation ----
    MET = MET_VALUES.get(activity_type, 5)
    weight_kg = body.get("weight", 70)  # 👈 optionally let frontend send weight
    calories = int(duration * MET * 3.5 * weight_kg / 200)

    # ---- Uniform schema ----
    doc = {
        "id": body.get("id", str(uuid.uuid4())),   # allow client to send id, else generate
        "userId": user_id,
        "type": activity_type,
        "durationMinutes": duration,
        "calories": calories,
        "notes": body.get("notes", ""),            # always present
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }

    try:
        container = get_container()  # ✅ reuse shared client
        container.create_item(doc)
        logging.info(f"✅ Inserted activity for user {user_id}: {activity_type} ({duration}m)")
    except Exception as e:
        logging.error(f"❌ Error inserting activity: {str(e)}")
        return func.HttpResponse("Failed to insert activity", status_code=500)

    return func.HttpResponse(
        json.dumps({"message": "Activity logged", "data": doc}),
        mimetype="application/json",
        status_code=200
    )


# ---------- GET /activities/{userId} ----------
@app.function_name(name="get_activities")
@app.route(route="activities/{userId}", methods=["GET"], auth_level=func.AuthLevel.ANONYMOUS)
def get_activities(req: func.HttpRequest) -> func.HttpResponse:
    user_id = req.route_params.get("userId")

    try:
        container = get_container()

        query = "SELECT * FROM c WHERE c.userId = @uid ORDER BY c.timestamp DESC"
        items = list(container.query_items(
            query=query,
            parameters=[{"name": "@uid", "value": user_id}],
            enable_cross_partition_query=True
        ))

    except Exception as e:
        logging.exception("❌ Error reading from Cosmos")
        return func.HttpResponse(f"Cosmos error: {str(e)}", status_code=500)

    return func.HttpResponse(
        json.dumps({"count": len(items), "items": items}),
        mimetype="application/json",
        status_code=200
    )



# MET values (Metabolic Equivalent of Task) — rough estimates
MET_VALUES = {
    "run": 10,     # vigorous running
    "walk": 4,     # brisk walk
    "cycle": 8,    # moderate cycling
    "swim": 9,     # swimming
    "other": 5     # fallback
}

@app.function_name(name="get_summary")
@app.route(route="activities/summary/{userId}", methods=["GET"], auth_level=func.AuthLevel.ANONYMOUS)
def get_summary(req: func.HttpRequest) -> func.HttpResponse:
    user_id = req.route_params.get("userId")

    try:
        container = get_container()

        # filters (optional)
        activity_type = req.params.get("type")  # e.g. ?type=run
        from_date = req.params.get("from")      # e.g. ?from=2025-08-01
        to_date = req.params.get("to")          # e.g. ?to=2025-08-20

        # Defaults if not provided → last 7 days
        if not from_date:
            from_date = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
        if not to_date:
            to_date = datetime.now(timezone.utc).isoformat()

        # Build WHERE clause
        where = "c.userId = @userId AND c.timestamp >= @from AND c.timestamp <= @to"
        params = [
            {"name": "@userId", "value": user_id},
            {"name": "@from", "value": from_date},
            {"name": "@to", "value": to_date},
        ]

        if activity_type:
            where += " AND c.type = @type"
            params.append({"name": "@type", "value": activity_type})

        query = f"SELECT * FROM c WHERE {where}"

        # Run query
        items = list(container.query_items(query=query, parameters=params, enable_cross_partition_query=True))

        # Compute summary
        total_minutes = sum(int(i.get("durationMinutes", 0)) for i in items)
        total_calories = sum(int(i.get("calories", 0)) for i in items)

        summary = {
            "userId": user_id,
            "from": from_date,
            "to": to_date,
            "filterType": activity_type or "all",
            "totalActivities": len(items),
            "totalMinutes": total_minutes,
            "totalCalories": total_calories,
        }

        return func.HttpResponse(json.dumps(summary), mimetype="application/json", status_code=200)

    except Exception as e:
        logging.exception("❌ Error creating summary")
        return func.HttpResponse(f"Error creating summary: {str(e)}", status_code=500)



# ---------- PUT /activities/{id} : update an activity ----------
@app.function_name(name="update_activity")
@app.route(route="activities/{activityId}", methods=["PUT"], auth_level=func.AuthLevel.ANONYMOUS)
def update_activity(req: func.HttpRequest) -> func.HttpResponse:
    activity_id = req.route_params.get("activityId")

    try:
        body = req.get_json()
    except ValueError:
        return func.HttpResponse("Invalid JSON", status_code=400)

    try:
        container = get_container()

        # fetch existing doc
        doc = container.read_item(item=activity_id, partition_key=body.get("userId"))

        # update fields if present
        if "type" in body: doc["type"] = body["type"]
        if "durationMinutes" in body: doc["durationMinutes"] = body["durationMinutes"]
        if "notes" in body: doc["notes"] = body["notes"]

        # replace item in DB
        container.replace_item(item=activity_id, body=doc)

        return func.HttpResponse(json.dumps({"message": "Activity updated", "data": doc}),
                                 mimetype="application/json", status_code=200)

    except exceptions.CosmosResourceNotFoundError:
        logging.error(f"❌ Activity {activity_id} not found for user {user_id}")
        return func.HttpResponse("Activity not found", status_code=404)
    except Exception as e:
        logging.exception("❌ Error updating activity")
        return func.HttpResponse(f"Error updating activity: {str(e)}", status_code=500)


# ---------- DELETE /activities/{id} : delete an activity ----------
@app.function_name(name="delete_activity")
@app.route(route="activities/{activityId}", methods=["DELETE"], auth_level=func.AuthLevel.ANONYMOUS)
def delete_activity(req: func.HttpRequest) -> func.HttpResponse:
    activity_id = req.route_params.get("activityId")
    user_id = req.params.get("userId")  # must be passed in query string

    if not user_id:
        logging.error("❌ Missing userId in DELETE /activities")
        return func.HttpResponse("Missing userId (required for partition key)", status_code=400)

    try:
        container = get_container()

        # delete item (requires partition key)
        container.delete_item(item=activity_id, partition_key=user_id)

        return func.HttpResponse(
            json.dumps({"message": "Activity deleted", "id": activity_id}),
            mimetype="application/json",
            status_code=200
        )

    except exceptions.CosmosResourceNotFoundError:
        logging.error(f"❌ Activity {activity_id} not found for user {user_id}")
        return func.HttpResponse("Activity not found", status_code=404)
    except Exception as e:
        logging.exception("❌ Error deleting activity")
        return func.HttpResponse(f"Error deleting activity: {str(e)}", status_code=500)



