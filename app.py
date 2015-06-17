from flask import Flask, render_template, request, redirect, url_for, flash, session
from pymongo import MongoClient
from functools import wraps
import config

app = Flask(__name__)
"""
Local DB:
#steps
"""
client = MongoClient()
# client = MongoClient("mongodb://admin:alpine@ds061671.mongolab.com:61671/character-sheets")
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
    success = username_free(user)
    if success:
        user_id = users.insert(new)
        print user_id
    return success

#return True if username is not in use
def username_free(username):
    return users.find_one({"username":username}) == None

################# Routing & Pages #####################

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/char")
def char():
    return render_template("character.html")

@app.route("/login",methods=["GET","POST"])
def login():
    error = ""
    if request.method == "POST":
        username = request.form["username"]
        pw = request.form["password"]
        valid = auth(username,pw)
        if valid:
            session["username"] = username
            flash("Successfully logged in.")
            return redirect(url_for("index"))
        else:
            flash("Username/password invalid.")
    return render_template("login.html")

@app.route('/logout')
@requires_auth
def logout():
    print session['username']
    session.pop('username', None)
    return redirect(url_for('index'))

@app.route('/register', methods=["GET","POST"])
def register():
    reg = ""
    if request.method == "POST":
        user = request.form['username']
        pw = request.form['password']
        pw2 = request.form['confirm_password']
        if (user != "" or pw != "" or pw2 != "") and pw == pw2:
            reg = create_user(user,pw)
            if reg:
                flash("Success! You may now log in.")
                return redirect(url_for('login'))
            else:
                flash("Sorry, username already registered.")
                return redirect(url_for('register'))
        else:
            flash("Please enter a valid username and password.")
            return redirect(url_for('register'))
    else:
        return render_template("register.html")

@app.route("/user/<username>")
def profile(username=None):
    user = users.find_one({"username":username})
    if user != None:
        return render_template("profile.html",user=user)
    else:
        flash("User not found.")
        return redirect(url_for('index'))

@app.route("/settings",methods=["GET","POST"])
@requires_auth
def settings(username=None):
    if "username" not in session:
        flash("You must login to access this page.")
        return redirect(url_for("login"))
    user = users.find_one({"username":session["username"]})
    error = ""
    if request.method == "POST":
        #change settings
        location = request.form['location']
        about = request.form['about']
        db.users.update(
            { 'username': session['username'] },
            { '$set': { 'location':location, 'about':about } } )
        user = users.find_one({"username":session["username"]})
        flash("Changed settings.")
    return render_template("settings.html",user=user)

@app.route("/server/<statname>", methods=["PUT"])
def server(statname=None):
    attributes = request.get_json()
    print "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~HEY LOOK OVER HERE"
    print attributes
    print statname
    print "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~YOU CAN STOP NOW"
    db.users.update_one(
        {"username": session["username"]},
        {"$set": {statname: attributes["value"]}},
        upsert=True)
    return statname
    
if __name__ == "__main__":
    app.secret_key = config.getSecret()
    app.debug = True
    app.run()
