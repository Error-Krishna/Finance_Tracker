from pymongo import MongoClient

client = MongoClient("mongodb+srv://iamkrishnagoyal:Krishnamongo@pft.logiw.mongodb.net/?retryWrites=true&w=majority&appName=PFT")
db = client["finance_tracker"]

print("Collections:", db.list_collection_names())  # Check if 'expenses' and 'incomes' exist