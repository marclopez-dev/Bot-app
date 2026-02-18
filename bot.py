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
    
if __name__=="__main__":
    app.run(debug=True)
