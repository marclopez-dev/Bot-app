from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import os
#
from openai import OpenAI
from duckduckgo_search import DDGS
#
client = OpenAI(
    api_key=os.environ.get("CLAVE_APIKEY")
)
def buscar(query):
    with DDGS as ddgs:
        resultado = list(ddgs.text(query, max_results=3))
        return " ".join([r["body"] for r in resultado])
def responder(pregunta):
    contexto = buscar(pregunta)
    response = client.chat.completions.create(
        model = "gpt-4o-mini",
        messages = [
            {
                "role": "system",
                "content": "Redacta respuestas claras y con fluides humana"
            },
            {
                "role": "user",
                "content": f"Usa esta información para responder:\n{contexto}\n\nPregunta:{pregunta}"
            }
            
        ]
    )
    return response.choices[0].message.content
    

app=Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL" )
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)
class Usuario(db.Model):
    num_usu = db.Column(db.Integer, primary_key=True)
    people = db.Column(db.String(100), unique=True, nullable=False)
    close = db.Column(db.String(200), nullable=False)
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

############################################################################
################################################################################
#/CEREBRO DEL BOT:
######################################################################################
##############################################################################################
@app.route("/mensaje",
methods = ["POST"])
def mensaje():
    datos_recibidos = request.json
    texto = datos_recibidos["mensaje"]
    rep = responder(texto)
    return  jsonify({"respuesta":rep})

#########################################################################
##################################################################################
#############################################################################################
#########################################################################################################
@app.route("/registro",
methods=["POST", "GET"] )
def registro():
    if request.method=="POST":
        username=request.form["username"]
        password=request.form["password"]
        comprobar_name=Usuario.query.filter_by(people=username).first()
        if comprobar_name:
            return render_template("aviso.html")
        else:
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
