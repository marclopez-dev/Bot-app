from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
app=Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///usuarios.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)
class Usuario(db.Model):
    num_usu = db.Column(db.Integer, primary_key=True)
    people = db.Column(db.String(100), unique=True, nullable=False)
    close = db.Column(db.String(100), nullable=False)
with app.app_context():
    db.create_all()
@app.route("/")
def on():
    return render_template("index.html")
@app.route("/PAG1")
def pop():
    return render_template("inicio.html")
@app.route("/Pag2")
def one():
    return render_template("limork.html")
@app.route("/chat")
def chat():
    return render_template("chat.html")
@app.route("/mensaje",
methods = ["POST"])
def mensaje():
    datos_recibidos = request.json
    texto = datos_recibidos["mensaje"]
    if "hola" in texto.strip().lower():
        mensaje_respuesta = "Hola, ¿cómo estás?"
    elif "¿que haces?" in texto.strip().lower():
        mensaje_respuesta = "Hago lo que tú necesites"
    else:
         mensaje_respuesta = "No tengo respuesta para ese mensaje" 
    return  jsonify({"respuesta": mensaje_respuesta})
@app.route("/registro",
methods=["POST", "GET"] )
def registro():
    if request.method=="POST":
        username=request.form["username"]
        password=request.form["password"]
        usuarios_registrados = Usuario(
            people = username,
            close = generate_password_hash(password)
        )
        db.session.add(usuarios_registrados)
        db.session.commit()
    return render_template("registro.html")

@app.route("/sesion", 
methods=[ "GET", "POST" ])
def sesion():
    if request.method=="POST":
        username1=request.form["usuario1"]
        password1=request.form["seguro1"]
        datos = Usuario.query.filter_by(people=username1).first()
        if datos and check_password_hash(datos.close, password1):
            return render_template("chat.html")
    return render_template("sesion.html")

if __name__=="__main__":
    app.run(debug=True)
