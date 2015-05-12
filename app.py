from flask import Flask, render_template, request, redirect, url_for, flash, session
from pymongo import MongoClient
from functools import wraps
import config

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

def create_user(user, pw):
    new = { 'username': user, 'password': pw }
    try:
        user_id = users.insert(new)
        print user_id
        return "User successfully created."
    except:
        return "Username already in database."

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

@app.route('/logout')
def logout():
    print session['username']
    session.pop('username', None)
    return redirect(url_for('index'))

@app.route('/register', methods=["GET","POST"])
def register():
    error = ""
    if request.method == "POST":
        user = request.form['username']
        pw = request.form['password']
        pw2 = request.form['confirm_password']
        if (user != "" or pw != "" or pw2 != "") and pw == pw2:
            error = create_user(user,pw)
        else:
            error = "Please enter a valid username and password."
    if(error):
        flash(error)
    return render_template("register.html")

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
    app.secret_key = config.getSecret()
    app.debug = True
    app.run()
