
// Clase que me representa el juego
class Board {
	constructor(width, height) {
		this.width = width;
		this.height = height;
		this.playing = false;
		this.game_over = false;
		this.bars = [];
		this.ball = null;

	};
	get elements() {
		let elements = this.bars.map(bar => bar);
		elements.push(this.ball);
		return elements;
	}
};

// Clse que representa a la bola
class Ball {
	constructor(x, y, radius, board) {
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.board = board;
		this.speed_x = 3;
		this.speed_y = 0;
		this.direction = 1;
		this.bounce_angle = 0;
		this.max_bounce_angle = Math.PI / 2;
		this.speed = 3;
		this.kind = "circle";

		board.ball = this;
	}
	 
	//Metodo que permite mover la bola
	move() {
		this.x += (this.speed_x * this.direction);
		this.y += (this.speed_y);
	}

	get width() {
		return this.radius * 2;
	}

	get height() {
		return this.radius * 2;
	}

	//Funcion que permite a la bola tomar una direccion de acuerdo a una colision
	collision = bar => {
		//Reaccion a la colision
		let relative_intersect_y = (bar.y + (bar.height / 2)) -
			this.y;

		let normalized_intersect_y = relative_intersect_y /
			(bar.height / 2);

		this.bounce_angle = normalized_intersect_y * this.max_bounce_angle;

		this.speed_y = this.speed * -Math.sin(this.bounce_angle);
		this.speed_x = this.speed * Math.cos(this.bounce_angle);

		if (this.x > (this.board.width / 2)) {
			this.direction = -1;
		} else {
			this.direction = 1;
		}
	}
};

//Clase que representa a las barras o raquetas del juego
class Bar {
	constructor(x, y, width, height, board) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.board = board;
		this.board.bars.push(this);
		this.kind = "rectangle";
		this.speed = 5;
	}

	down = () => this.y += this.speed;
	up = () => this.y -= this.speed;
};

//Clase que representa el tablero del juego
class BoardView {
	constructor(canvas, board) {
		this.canvas = canvas;
		this.board = board;
		this.ctx = canvas.getContext("2d");
		this.canvas.height = board.height;
		this.canvas.width = board.width;
	}

	clean = () => this.ctx.clearRect(0, 0, this.board.width,
		this.board.height);

	draw = () => {

		for (let i in this.board.elements) {
			let el = this.board.elements[i];
			this.drawf(this.ctx, el);
		}
	};

	check_collisions = () => {

		for (let i of this.board.bars) {
			if (this.hit(i, this.board.ball)) {
				this.board.ball.collision(i);
			}
		}

		if (this.board.ball.x < 0 || this.board.ball.x > 800) {
		
			this.board.ball.speed_x *= -1;
		}

		//Colicones horizontales
		if (this.board.ball.y < 0 || this.board.ball.y > 400) {
			this.board.ball.speed_y *= -1;
		}
	};

	play = () => {
		if (this.board.playing) {
			this.clean();
			this.draw();
			this.check_collisions();
			this.board.ball.move();
		}
	};

	hit(a, b) {
		let hit = false;
		//Colisiones horizontales
		if ((b.x + b.width >= a.x + a.width) && (b.x < a.x + a.width)) {
			//Colisiones verticales
			if ((b.y + b.height >= a.y) && (b.y < a.y + a.height))
				hit = true;
		}

		//Colisión de a con b
		if (b.x <= a.x && b.x + b.width >= a.x + a.width) {
			if (b.y <= a.y && b.y + b.height >= a.y + a.height)
				hit = true;
		}

		//Colisión b con a
		if (a.x <= b.x && a.x - a.width >= b.x + b.width) {
			if (a.y <= b.y && a.y + a.height >= b.y + b.height)
				hit = true;
		}

		return hit;
	};

	drawf(ctx, element) {
		switch (element.kind) {
			case "rectangle":
				ctx.fillRect(element.x, element.y, element.width, element.height);
				break;
			case "circle":
				ctx.beginPath();
				ctx.arc(element.x, element.y, element.radius, 0, 7);
				ctx.fill();
				ctx.closePath();
				break;
		}
	}
}

var board1 = new Board(800, 400);
var bar_1 = new Bar(0, 100, 20, 100, board1);
var bar_2 = new Bar(780, 100, 20, 100, board1);
var ball = new Ball(350, 100, 10, board1);
var canvas1 = document.getElementById('canvas');
var board_view = new BoardView(canvas1, board1);

document.addEventListener("keydown", function (ev) {
	if (ev.which == 87) {
		ev.preventDefault();
		bar_1.up();
	} else if (ev.which == 83) {
		ev.preventDefault();
		bar_1.down();
	} else if (ev.which === 38) {
		ev.preventDefault();
		bar_2.up();
	} else if (ev.which === 40) {
		ev.preventDefault();
		bar_2.down();
	} else if (ev.which === 32) {
		ev.preventDefault();
		board1.playing = !board1.playing;
	}
});

board_view.draw();

window.requestAnimationFrame(controller);

function controller() {
	board_view.play();
	if (board_view.board.game_over) location.reload();
	requestAnimationFrame(controller);

}