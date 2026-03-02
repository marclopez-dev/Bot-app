from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import os
#
from groq import Groq
from duckduckgo_search import DDGS
####################################################################################
client = Groq(
    api_key=os.environ.get("CLAVE_APIKEY")
)
def buscar(query):
    with DDGS() as ddgs:
        resultado = list(ddgs.text(query, max_results=3))
        return " ".join([r["body"] for r in resultado])
def responder(usuar, pregunta):
    try:
        guardar_mensajes(usuar, "user", pregunta)
        historial = obtener_historial(usuar)
        contexto = buscar(pregunta)
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            mensajes = historial,
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
        respuesta = completion.choices[0].message.content
        guardar_mensaje(usuar, "assistant", respuesta)
        return respuesta
    except Exception as e:
        return "Hubo un error generando la respuesta." 
##########################################
#Base de datos para "almacenar registros"
######################№###################
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
##########################################
#base de datos "el chat pueda recordar las conversaciones de los usuarios"
##########################################
app.config["SQLALCHEMY_DATABASE_URI"]=os.environ.get("BASE_URL")
app.config["SQLALCHMY_TRACK_MODIFICATIONS#"]=False
CHT=SQLAlchemy(app)
class Mensajes(CHT.Mode):
    id = CHT.Column(CHT.Integer, primary_key=True)
    usuar = CHT.Column(CHT.String(100))
    role = CHT.Column(CHT.String(20))
    content = CHT.Column(CHT.Text)
    tiempo = CHT.Column(CHT.DateTime, default=datetime.utcnow)
with app.app_context():
    app.create_all()
def guardar_mensajes(usuar, role, content):
    nuevo = Mensajes(
        usuar = usuar,
        role = role, 
        content = content
    )
    CHT.session.add(nuevo)
    CHT.session.commit()
def obtener_historial(usuar):
    mensajes = Mensajes.query.filter_by(usuario=usuar).order_by(Mensajes.id.asc()).all()
    return [
        {
         "role": m.role,
         "content":m.content
        }
        for m in mensajes
    ]
####################################################################################
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
