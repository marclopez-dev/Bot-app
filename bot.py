from flask import Flask, render_template
app=Flask(__name__)
@app.route("/")
def on():
    return render_template("index.html")
@app.route("/PAG1")
def pop():
    return render_template("inicio.html")
if __name__=="__main__":
    app.run(debug=True)
