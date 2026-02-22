from flask import Flask, render_template, request, jsonify
app=Flask(__name__)
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
datos = []
@app.route("/registro",
methods=["POST", "GET"] )
def registro():
    if request.method=="POST":
        username=request.form["username"]
        password=request.form["password"]
        datos.append({
            "usuario":username,
            "contraseña":password
        })
    return render_template("registro.html")
@app.route("/sesion", 
methods=[ "GET", "POST" ])
def sesion():
    if request.method=="GET":
        username1=request.form["usuario"]
        password1=request.form["seguro"]
        for data in datos:
            if data["usuario"] == request.form["usuario"] and data["contraseña"] == request.form["seguro"]:
                return render_template("chat.html")
    return render_template("sesion.html")

if __name__=="__main__":
    app.run(debug=True)
