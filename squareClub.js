//MACROES
const SPEED = 10;
//END MACROES

const WebSocket = require("ws");
const {createServer} = require("http");
const ecstatic = require("ecstatic");
const httpServer = createServer(ecstatic({root:"./public"}));
const server = new WebSocket.Server({server: httpServer});
httpServer.listen(8000);

let state = [];
let connections = [];
let nextTag = 0;
server.on("connection", ws => {
	const id = nextTag++;
	connections.push(ws);
	console.log("connect!");
	ws.on("message", message => {
		const input = JSON.parse(message);
		if(input.type == "input")controlHandler(input.code,id);
		else if(input.type == "new"){
			state[id] = new Square(id, input.name);
			updateConnection();
		}
	});
	ws.on("close", () => {
		state[id].text = "dead";
		updateConnection();
	});
});
class Square{
	constructor(id,name){
		this.id = id;
		this.name = name;
		this.text = name;
		this.x = Math.random()*750;
		this.y = Math.random()*560;
	}
	move(x,y){
		let X = x + this.x, Y = y + this.y;
		if(X>750)X=750;
		if(X<0)X=0;
		if(Y>560)Y=560;
		if(Y<0)Y=0;
		this.x = X;
		this.y = Y;
		updateConnection();
	}
}
function controlHandler(code,id){
	let x=0; y=0;
	if(code == "ArrowUp")y=-SPEED;
	if(code == "ArrowDown")y+=SPEED;
	if(code == "ArrowLeft")x=-SPEED;
	if(code == "ArrowRight")x+=SPEED;
	state[id].move(x,y);
}
function updateConnection(){
	for(let ws of connections)ws.send(JSON.stringify(state));
}
	