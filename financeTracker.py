from flask_cors import CORS
import base64
from flask import Flask, request, jsonify, render_template
from pymongo import MongoClient
from bson import ObjectId
import bcrypt
import os

app = Flask(__name__, static_folder='static', template_folder='templates')  # explicitly define folders
CORS(app)

# MongoDB Setup
client = MongoClient("mongodb+srv://iamkrishnagoyal:Krishnamongo@pft.logiw.mongodb.net/?retryWrites=true&w=majority")
db = client["financeTracker"]
users_col = db["users"]
incomes_col = db["incomes"]
expenses_col = db["expenses"]
budgets_col = db["budgets"]

# ---------- Serve HTML ----------

@app.route('/')
def serve_auth():
    return render_template('auth.html')

@app.route('/home')
def serve_home():
    return render_template('index.html')

# ---------- USER AUTH ----------

@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if users_col.find_one({"username": username}):
        return jsonify({"message": "Username already exists"}), 409

    hashed_pw = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    users_col.insert_one({
        "username": username,
        "password": hashed_pw
    })
    return jsonify({"message": "User registered successfully!"})

@app.route("/signup/", methods=["POST"])
def signup():
    data = request.json
    username = data["username"]
    password = data["password"]

    if users_col.find_one({"username": username}):
        return jsonify({"message": "Username already exists"}), 409

    hashed_pw = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    users_col.insert_one({"username": username, "password": hashed_pw})

    return jsonify({"message": "Signup successful"})

@app.route("/login/", methods=["POST"])
def login():
    data = request.json
    username = data["username"]
    password = data["password"]

    user = users_col.find_one({"username": username})
    if not user or not bcrypt.checkpw(password.encode("utf-8"), user["password"]):
        return jsonify({"error": "Invalid credentials"}), 401

    return jsonify({"message": "Login successful", "user_id": str(user["_id"])})

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
    print(data)  # inside add_income or add_expense
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
    print(data)  # inside add_income or add_expense
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
    user_id = request.json.get("user_id")
    print("Received user_id:", user_id)

    try:
        total_income = sum(float(i.get("amount", 0)) for i in incomes_col.find({"user_id": user_id}))
        total_expenses = sum(float(e.get("amount", 0)) for e in expenses_col.find({"user_id": user_id}))

        budget_doc = budgets_col.find_one({"user_id": user_id})
        monthly_budget = float(budget_doc["budget"]) if budget_doc and "budget" in budget_doc else None

        if monthly_budget is not None:
            remaining_budget = monthly_budget - total_expenses
            over_budget = max(0, total_expenses - monthly_budget)
        else:
            remaining_budget = total_income - total_expenses
            over_budget = 0

        available_balance = total_income - total_expenses

        print("Total Income:", total_income)
        print("Total Expenses:", total_expenses)
        print("Available Balance:", available_balance)

        return jsonify({
            "total_income": total_income,
            "total_expenses": total_expenses,
            "remaining_budget": remaining_budget,
            "monthly_budget": monthly_budget,
            "over_budget": over_budget,
            "available_balance": available_balance,
        })

    except Exception as e:
        print("Error in /budget_status:", str(e))
        return jsonify({"error": "Internal Server Error"}), 500

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

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)