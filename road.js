class Road {
    constructor(x, width, laneCount=3) {
        this.x=x;
        this.width=width;
        this.laneCount=laneCount;

        this.left=x-width/2;
        this.right=x+width/2

        const infinity = 1000000; //when passing here the infinity number weird things can happen
        this.top=-infinity; //remember that the coordinate system is reversed ("+" is at the bottom and "-" on the top)
        this.bottom=infinity;


        //getting the borders of the road
        const topLeft={x:this.left, y:this.top};
        const topRight={x:this.right, y:this.top};
        const bottomLeft={x:this.left, y:this.bottom};
        const bottomRight={x:this.right, y:this.bottom};
        this.borders=[
            [topLeft, bottomLeft],
            [topRight, bottomRight]
        ];
    }

    //this function will put the car in the middle of specified lane (passed in a parameter in main.js) 
    //note that laneIndex starts count from zero!! 
    getLaneCenter(laneIndex) {
        const laneWidth=this.width/this.laneCount;
        return this.left+laneWidth/2+Math.min(laneIndex, this.laneCount-1)*laneWidth;
    }


    //drawing lanes on the road
    draw(ctx) {
        ctx.lineWidth = 5;
        ctx.strokeStyle="white";

        for (let i=1; i<=this.laneCount-1; i++){
            const x=lerp(
                this.left,
                this.right,
                i/this.laneCount
            );

            
            ctx.setLineDash([20,20]); //line-dash will have 20px width and 20px break
            ctx.beginPath();
            ctx.moveTo(x, this.top);
            ctx.lineTo(x, this.bottom);
            ctx.stroke();
        }

        //add dashes
        ctx.setLineDash([]);
        this.borders.forEach(border=>{
            ctx.beginPath();
            ctx.moveTo(border[0].x,border[0].y);
            ctx.lineTo(border[1].x,border[1].y);
            ctx.stroke();
        });
    }
}



/* add dashes previous version
            if (i>0 && i<this.laneCount) {
                ctx.setLineDash([20,20]); //line-dash will have 20px width and 20px break 
            } 
            else {
                ctx.setLineDash([]);
            } */