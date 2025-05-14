
from flask_cors import CORS
from flask import render_template
import base64
from flask import Flask, request, jsonify, send_from_directory
from pymongo import MongoClient
from bson import ObjectId
import bcrypt
import os

app = Flask(__name__)
CORS(app)

# MongoDB Setup
client = MongoClient("mongodb+srv://iamkrishnagoyal:Krishnamongo@pft.logiw.mongodb.net/?retryWrites=true&w=majority")
db = client["financeTracker"]
users_col = db["users"]
incomes_col = db["incomes"]
expenses_col = db["expenses"]
budgets_col = db["budgets"]

# ---------- Serve HTML / Static Files ----------
@app.route('/')
def serve_home():
    return render_template('auth.html')

@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory(os.getcwd(), filename)

# ---------- USER AUTH ----------

@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    print("[DEBUG] Received data:", data)

    username = data.get("username")
    password = data.get("password")

    if users_col.find_one({"username": username}):
        print("[INFO] User already exists")
        return jsonify({"message": "Username already exists"}), 409

    hashed_pw = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    users_col.insert_one({
        "username": username,
        "password": hashed_pw
    })

    print(f"[INFO] Registered user: {username}")
    return jsonify({"message": "User registered successfully!"})


@app.route("/signup", methods=["POST"])
def signup():
    data = request.json
    username = data["username"]
    password = data["password"]

    if users_col.find_one({"username": username}):
        return jsonify({"message": "Username already exists"}), 409

    hashed_pw = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    user = {
        "username": username,
        "password": hashed_pw
    }

    users_col.insert_one(user)
    return jsonify({"message": "Signup successful"})


@app.route("/login", methods=["POST"])
def login():
    data = request.json
    username = data["username"]
    password = data["password"]

    user = users_col.find_one({"username": username})
    if not user:
        return jsonify({"error": "Invalid credentials"}), 401

    if not bcrypt.checkpw(password.encode("utf-8"), user["password"]):
        return jsonify({"error": "Invalid credentials"}), 401

    return jsonify({
        "message": "Login successful",
        "user_id": str(user["_id"])
    })


# ---------- INCOME / EXPENSE ----------

@app.route("/add_income", methods=["POST"])
def add_income():
    data = request.json
    income = {
        "user_id": data["user_id"],
        "source": data["source"],
        "amount": float(data["amount"]),
        "date": data["date"]
    }
    incomes_col.insert_one(income)
    return jsonify({"message": "Income added"})


@app.route("/add_expense", methods=["POST"])
def add_expense():
    data = request.json
    expense = {
        "user_id": data["user_id"],
        "category": data["category"],
        "amount": float(data["amount"]),
        "date": data["date"],
        "description": data["description"]
    }
    expenses_col.insert_one(expense)
    return jsonify({"message": "Expense added"})


# ---------- BUDGET FEATURES ----------

@app.route("/set_budget", methods=["POST"])
def set_budget():
    data = request.json
    user_id = data["user_id"]
    budget = float(data["budget"])

    budgets_col.update_one(
        {"user_id": user_id},
        {"$set": {"budget": budget}},
        upsert=True
    )

    return jsonify({"message": "Budget updated successfully"})


@app.route("/budget_status", methods=["POST"])
def budget_status():
    user_id = request.json["user_id"]

    total_income = sum(i["amount"] for i in incomes_col.find({"user_id": user_id}))
    total_expenses = sum(e["amount"] for e in expenses_col.find({"user_id": user_id}))

    budget_doc = budgets_col.find_one({"user_id": user_id})
    monthly_budget = budget_doc["budget"] if budget_doc and "budget" in budget_doc else None

    # Only show remaining budget if monthly_budget is set
    if monthly_budget is not None:
        remaining_budget = monthly_budget - total_expenses
    else:
        remaining_budget = total_income - total_expenses
        monthly_budget = None  # To let frontend know budget isn't set

    return jsonify({
        "total_income": total_income,
        "total_expenses": total_expenses,
        "remaining_budget": remaining_budget,
        "monthly_budget": monthly_budget
    })


# ---------- SPENDING TRENDS ----------

@app.route("/spending_trends", methods=["POST"])
def spending_trends():
    user_id = request.json["user_id"]

    pipeline = [
        {"$match": {"user_id": user_id}},
        {"$group": {"_id": "$category", "total": {"$sum": "$amount"}}}
    ]
    trends = list(expenses_col.aggregate(pipeline))

    return jsonify({"trends": trends})


# ---------- MAIN ----------

if __name__ == '__main__':
    app.run(debug=False)  # Use gunicorn in production, not this