from flask import Flask, render_template, request, jsonify, redirect, url_for, send_file, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import os
#
from urllib.parse import urlparse
import yt_dlp
#
from datetime import datetime 
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
        historial = obtener_historial(usuar)
        contexto = buscar(pregunta)
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages = [
                {
                    "role": "system",
                    "content": "Eres un asistente conversacional natural. "
                        "Habla de forma relajada y fluida. "
                        "Responde como en una conversación normal entre personas. "
                        "Puedes hacer preguntas cortas para continuar la charla."
                        "No uses mucho texto si no es necesario."
                }
            ]
            + historial +
            [   
                {
                    "role": "user",
                    "content": pregunta
                }
            
            ]
        )
        respuesta = completion.choices[0].message.content
        guardar_mensajes(usuar, "user", pregunta)
        guardar_mensajes(usuar, "assistant", respuesta)
        return respuesta
    except Exception as e:
        print(e)
        return str(e)
##########################################
##########################################
def detectar_url(url):
    enlace = urlparse(url)
    return all([enlace.scheme, enlace.netloc])
def enviar_descarga(video):
    text = {
        "outtmpl": "descargas/%(title)s.%(ext)s"
    }
    with yt_dlp.YoutubeDL(text) as ydl:
        titulo = ydl.extract_info(video, download=True)
        nombre_archivo = ydl.prepare_filename(titulo)
        return os.path.basename(nombre_archivo)

####################################################################################
def send_mp3(audio):
    try:
        almacen = {
            "format": "bestaudio[ext=m4a]",
            "outtmpl": "descargas/%(id)s.%(ext)s",
            }
        with yt_dlp.YoutubeDL(almacen) as yt:
            title = yt.extract_info(f"ytsearch1:{audio}", download=True)
            if not title.get("entries"):
                return None
            mine = title["entries"][0]
            return f"{mine['id']}.m4a"
    except Exception as e:
        print("ERRER🥶📩📩📩📩", e)
        return None

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
##########################################
#base de datos "el chat pueda recordar las conversaciones de los usuarios"
##########################################
class Mensajes(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    usuar = db.Column(db.String(100))
    role = db.Column(db.String(20))
    content = db.Column(db.Text)
    tiempo = db.Column(db.DateTime, default=datetime.utcnow)
with app.app_context():
    db.create_all()
def guardar_mensajes(usuar, role, content):
    nuevo = Mensajes(
        usuar = usuar,
        role = role, 
        content = content
    )
    db.session.add(nuevo)
    db.session.commit()
def obtener_historial(usuar):
    mensajes = Mensajes.query.filter_by(usuar=usuar).order_by(Mensajes.id.asc()).all()
    return [
        {
         "role": m.role,
         "content":m.content
        }
        for m in mensajes
    ]
####################################################################################
@app.route("/desca/<neim>")
def decarga(neim):
    return send_from_directory("descargas", neim, as_attachment=True)

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

#########################################
#descragar musica y enviar a JS🥶🥶🥶🥶📩
#########################################
@app.route("/audio",
methods=["POST"])
def audio():
    att = request.json
    musica = att.get("audi")
    if musica:
        gemin = send_mp3(musica)
        if gemin:
            return jsonify(
                {
                 "byte": "m4p",
                 "url": f"https://bot-app-t2bk.onrender.com/desca/{gemin}"
                }
            )
        else:
            return jsonify({
                 "byte": "Archivo no encontrado"})
    else:
        return jsonify({
            "byte": "Escribe un nombre en la música"})
             

################################################################################
#/CEREBRO DEL BOT:
######################################################################################
##############################################################################################

@app.route("/mensaje",
methods = ["POST"])
def mensaje():
    try:
        datos_recibidos = request.json
        texto = datos_recibidos["mensaje"]
        usuar = request.remote_addr
        if detectar_url(texto):
            archivo = enviar_descarga(texto)
            if not archivo:
                return jsonify({
                    "tipo": "texto",
                    "respuesta": "error al encontrar el archivo"})
            return jsonify(
                {
                    "tipo": "archivo",
                    "url": f"/descargar/{archivo}"
                }
            )
        rep = responder(usuar, texto)
        return  jsonify({"respuesta": rep})
    except Exception as e:
        return jsonify({
            "tipo": "texto",
            "respuesta": str(e)  
        })
@app.route("/descargar/<nombre>")
def descargar(nombre):
    return send_from_directory("descargas", nombre, as_attachment=True)

#########################################################################
######################################### 
#############################################################################################
def link_verification(link):
    elc = urlparse(link)
    return all([elc.scheme, elc.netloc])
def send_vidio(dvd):
    date = {
    "format": "bestvideo+bestaudio/best",
    "outtmpl": "descargas/%(id)s.%(ext)s",
    "merge_output_format": "mp4",
    "quiet": True
    }
    with yt_dlp.YoutubeDL(date) as ylt:
        nombre = ylt.extract_info(dvd, download=True)
        name_file = ylt.prepare_filename(nombre)
        return os.path.basename(name_file)
@app.route("/down/<nm>")
def nmv(nm):
    return send_from_directory("descargas", nm, as_attachment=True)
########################
########################
@app.route("/responder",
methods=["POST"])
def responde():
    td = request.json
    usuar = td.get("from")
    msj = td.get("mensaje")
    rsp = None
    if msj and msj.strip().lower() == "/status" :
        rsp = f"🥶🙏ten paciencia: {usuar}"
    else:
        rsp = responder(usuar, msj)
    return jsonify({"respuesta": rsp})
#########################################
@app.route("/video",
methods=["POST"])
def video():
    yt = request.json
    video = yt.get("per")
    if link_verification(video):
        archivo = send_vidio(video)
        if archivo:
            return jsonify({
                "tipo": "archivo",
                "url": f"https://bot-app-t2bk.onrender.com/down/{archivo}"
            })
        else:
            return jsonify({
                "tip": "text",
                "texto": "lo siento tu archivo no existe"
                }
            )
    



################################################################
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
        return redirect(url_for("sesion"))
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
