//car canvas
const carCanvas=document.getElementById("carCanvas");
carCanvas.width=200;

//network canvas
const networkCanvas=document.getElementById("networkCanvas");
networkCanvas.width=300;

const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");

const road = new Road(carCanvas.width/2, carCanvas.width*0.9);

//car generation
const N=1;
const cars = generateCars(N)
let bestCar = cars[0];
if (localStorage.getItem("bestBrain")) {
    for (let i=0; i<cars.length; i++) {
        cars[i].brain = JSON.parse(localStorage.getItem("bestBrain"));
        if (i!=0) {
            NeuralNetwork.mutate(cars[i].brain, 0.1);
        }
    }
}

//creating dummy cars that will be our traffic
const traffic =[
    new Car(road.getLaneCenter(1), -100, 30, 50, "DUMMY", 2, getRandomColor()),
    new Car(road.getLaneCenter(0), -300, 30, 50, "DUMMY", 2, getRandomColor()),
    new Car(road.getLaneCenter(2), -300, 30, 50, "DUMMY", 2, getRandomColor()),
    new Car(road.getLaneCenter(0), -500, 30, 50, "DUMMY", 2, getRandomColor()),
    new Car(road.getLaneCenter(1), -500, 30, 50, "DUMMY", 2, getRandomColor()),
    new Car(road.getLaneCenter(1), -700, 30, 50, "DUMMY", 2, getRandomColor()),
    new Car(road.getLaneCenter(2), -700, 30, 50, "DUMMY", 2, getRandomColor())
];

animate();

//saving the best car to our local storage
function save() {
    localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain));
}

//removing the best car from local storage
function discard() {
    localStorage.removeItem("bestBrain");
}


//generane more cars living in a different universes 
function generateCars(N) {
    const cars = [];
    for (let i=1; i<=N; i++) {
        cars.push(new Car(road.getLaneCenter(1), 100, 30, 50, "AI")); //if you change "AI" to "KEYS" you will be able to control the car
    }
    return cars;

}

function animate(time){
    //create traffic (obstacle cars)
    for(let i=0; i<traffic.length;i++) {
        traffic[i].update(road.borders, []);
    }

    for (let i=0; i<cars.length; i++) {
        cars[i].update(road.borders, traffic);
    }

    //finding the best car to follow (the one that is the closest to our obstacle car, that has the min y value; look reverse circle)
    bestCar = cars.find(
        c=>c.y==Math.min(...cars.map(c=>c.y)) //we are creating the new array with only the "y" values of the cars and we have to spread the array values because min function doesn't work with arrays  
    );

    carCanvas.height=window.innerHeight;
    networkCanvas.height=window.innerHeight;

    //to follow the car like it has a camera
    carCtx.save();
    carCtx.translate(0,-bestCar.y+carCanvas.height*0.7); //to center the car while following it 


    road.draw(carCtx);
    //drawing traffic
    for(let i=0; i<traffic.length;i++) {
        traffic[i].draw(carCtx, "red");
    }
    
    //drawing multiple cars
    carCtx.globalAlpha = 0.2;
    for (let i=0; i<cars.length; i++) {
        cars[i].draw(carCtx, "blue");
    }
    carCtx.globalAlpha = 1;
    bestCar.draw(carCtx, "blue", true); // the only car that will have the sensors

    carCtx.restore();

    networkCtx.lineDashOffset =-time/50;
    Visualizer.drawNetwork(networkCtx, bestCar.brain);
    requestAnimationFrame(animate); //it gives the illusion of movement
}