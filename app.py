from flask import *
from pymongo import MongoClient
from functools import wraps

app = Flask(__name__)
client = MongoClient("mongodb://admin:alpine@ds061671.mongolab.com:61671/character-sheets")
db = client["character-sheets"]
users = db["users"]

################# Useful Functions ####################

def auth(username,password):
    user = users.find_one({"username":username,"password":password})
    return user != None

def requires_auth(f):
    @wraps(f)
    def inner(*args,**kwargs):
        if "username" not in session:
            flash("You must be logged in to access this page.")
            return redirect(url_for("login"))
        return f(*args,**kwargs)
    return inner

################# Routing & Pages #####################

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/main")
def main():
    username = "wally"
    return render_template("main.html",username=username)

@app.route("/login",methods=["GET","POST"])
def login():
    error = ""
    if request.method == "POST":
        username = request.form["username"]
        pw = request.form["password"]
        valid = auth(user,pw)
        if valid:
            session["username"] = username
            flash("You are successfully logged in.")
            return redirect(url_for("profile",username=username))
        else:
            error = "Username/password invalid."
    return render_template("login.html",error=error)

@app.route("/user/<username>")
@requires_auth
def profile(username=None):
    if "username" not in session:
        flash("You must login to access this page.")
        return redirect(url_for("login"))
    user = users.findone({"username":session["username"]})
    if user != None:
        return render_template("profile.html",user=user)
    else:
        flash("User not found.")
        return redirect(url_for("index"))

@app.route("/settings",methods=["GET","POST"])
@requires_auth
def settings(username=None):
    if "username" not in session:
        flash("You must login to access this page.")
        return redirect(url_for("login"))
    user = users.findone({"username":session["username"]})
    error = ""
    if request.method == "POST":
        #change settings
        user = users.findone({"username":session["username"]})
        flash("Changed settings.")
    return render_template("settings.html",user=user)

if __name__ == "__main__":
    app.debug = True
    app.run()
