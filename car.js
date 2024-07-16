class Car{
    constructor(x,y,width,height, controlType, maxSpeed=3, color="blue"){
        this.x=x;
        this.y=y;
        this.width=width;
        this.height=height;

        //so that car will not be moving so quickly
        this.speed=0;
        this.acceleration=0.2;

        //in case car will not disappear :((
        this.maxSpeed=maxSpeed; 
        this.friction=0.05; //tarcie
        this.angle=0;
        this.damaged=false //all cars are not damaged at the beginning

        //car uses the brain to teach thenself 
        this.useBrain = controlType == "AI";

        if(controlType!="DUMMY"){
            this.sensor = new Sensor(this); //passing the car through "this"
            this.brain = new NeuralNetwork([
                this.sensor.rayCount,6,4]);
        }

        this.controls=new Controls(controlType);

        this.img = new Image();
        this.img.src = "car.png"

        this.mask = document.createElement("canvas");
        this.mask.width = width;
        this.mask.height = height;

        const maskCtx = this.mask.getContext("2d");
        this.img.onload=()=> {
            maskCtx.fillStyle=color;
            maskCtx.rect(0,0, this.width, this.height);
            maskCtx.fill();

            maskCtx.globalCompositeOperation = "destination-atop";
            maskCtx.drawImage(this.img, 0, 0, this.width, this.height);
        }
    }

    update(roadBorders, traffic){
        if (!this.damaged) {
            this.#move();
            this.polygon=this.#createPolygon();
            this.damaged=this.#assessDamage(roadBorders, traffic); //check whether the car is damaged
        }
        if (this.sensor){
            this.sensor.update(roadBorders, traffic); //updating sensor and passing it roadBorders so that sensors can detect wheather border are close or not
            //when the car is hitting the border then it stops working
            const offsets = this.sensor.readings.map(
                //low values when the object is far away, bigger values when the object is getting closer to our car
                s=>s==null?0:1-s.offset
            );
            const outputs = NeuralNetwork.feedForward(offsets,this.brain);
            
            //to prevent the car from colission
            if (this.useBrain) {
                this.controls.forward = outputs[0];
                this.controls.left = outputs[1];
                this.controls.right = outputs[2];
                this.controls.reverse = outputs[3];
            }
        }
    }


    //method that checks if there are collisions between polygons and roadborders
    #assessDamage(roadBorders, traffic) {
        for (let i=0; i<roadBorders.length; i++) {
            if (polysIntersect(this.polygon, roadBorders[i])) {
                return true;
            }
        }
        //when the car hits the obstacle car then it will be damaged
        for (let i=0; i<traffic.length; i++) {
            if (polysIntersect(this.polygon, traffic[i].polygon)) {
                return true;
            }
        }
        return false;
    }

    //detects the corners of the car polygon=wielokąt
    #createPolygon(){
        const points=[];
        const rad=Math.hypot(this.width, this.height)/2; //hypotenuse/2 - przeciwprostokątna/2
        const alpha=Math.atan2(this.width, this.height);

        //top right corner
        points.push({
            x:this.x-Math.sin(this.angle-alpha)*rad,
            y:this.y-Math.cos(this.angle-alpha)*rad
        });
        //bottom left corner
        points.push({
            x:this.x-Math.sin(this.angle+alpha)*rad,
            y:this.y-Math.cos(this.angle+alpha)*rad
        });
        //top right corner
        points.push({
            x:this.x-Math.sin(Math.PI+this.angle-alpha)*rad,
            y:this.y-Math.cos(Math.PI+this.angle-alpha)*rad
        });
        //top right corner
        points.push({
            x:this.x-Math.sin(Math.PI+this.angle+alpha)*rad,
            y:this.y-Math.cos(Math.PI+this.angle+alpha)*rad
        });
        return points;
    }

    // # - means that this is a private method
    #move(){

         //up and down controls
         if(this.controls.forward){
            this.speed+=this.acceleration;
        }
        if(this.controls.reverse){
            this.speed-=this.acceleration;
        } 

        //to prevent car from moving so quickly or so slowly
        if (this.speed>this.maxSpeed) {
            this.speed=this.maxSpeed;
        }
        if (this.speed<-this.maxSpeed/2) {
            this.speed=-this.maxSpeed/2;
        }

        //friction during acceleration is decreasing and during deceleration is increasing
        if(this.speed>0) {
            this.speed-=this.friction;
        }
        if (this.speed<0) {
            this.speed+=this.friction;
        }

        //to prevent car from constant moving 
        if(Math.abs(this.speed)<this.friction){
            this.speed=0;
        }

        if(this.speed!=0){
            const flip=this.speed>0?1:-1;
            //left and right controls
            if(this.controls.left){
                this.angle+=0.03*flip;
            }
            if(this.controls.right){
                this.angle-=0.03*flip;
            }

        }


        //look at the unit_circle.jpg
        this.x-=Math.sin(this.angle)*this.speed;
        this.y-=Math.cos(this.angle)*this.speed;
    }
    
    draw(ctx, color, drawSensor=false){
        
        if (this.sensor && drawSensor){
            this.sensor.draw(ctx); //car will be drawing its own sensor
        }

        // 2nd version of car
        // the car will change color to grey if it touches the roadBorder
        // added also cdifferent colors for dummy car and our key car
        // if(this.damaged){
        //     ctx.fillStyle="grey";
        // } else {
        //     ctx.fillStyle=color;
        // }

        // ctx.beginPath();
        // ctx.moveTo(this.polygon[0].x, this.polygon[0].y);
        // for (let i=1; i<this.polygon.length; i++) {
        //     ctx.lineTo(this.polygon[i].x, this.polygon[i].y);
        // }
        // ctx.fill();

        // this code draws the car.png
        ctx.save();
        ctx.translate(this.x, this.y); //begin translation
        ctx.rotate(-this.angle); //add a rotation
        if (!this.damaged) {
            ctx.drawImage(this.mask,
                -this.width/2,
                -this.height/2,
                this.width,
                this.height
            );
            ctx.globalCompositeOperation="multiply"; //thanks to that the car can maintain their shape and also the parts that were not black
        }
        ctx.drawImage(this.img,
            -this.width/2,
            -this.height/2,
            this.width,
            this.height
        );
        ctx.restore(); //end translation

    }
}
