from flask import *

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/main")
def main():
    username = "wally"
    return render_template("main.html",username=username)

@app.route("/user/<username>")
def profile(username=None):
    return render_template("profile.html",username=username)

if __name__ == "__main__":
    app.debug = True
    app.run()
