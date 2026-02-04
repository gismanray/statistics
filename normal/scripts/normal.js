$(document).ready(main);

function main(){
	canvas = $('canvas');
	drawAxises();
	drawCurve();


	$('#zbox').keyup(function() {
		var str = $(this).val();
		if (str == '-' || str == '+' || str == '.') return;
		if (str.length > 0) {
			if (isNaN(str)) {
				alert('Invalid number!\nTry again');
				$(this).val('');
			}
		}
	})
	.focusin(function() {$('#pbox').val('');});

	$('#pbox').keyup(function() {
		var str = $(this).val();
		if (str == '.' || str == '+') return;
		if (str.length > 0) {
			if (isNaN(str)) {
				alert('Invalid number!\nTry again');
				$(this).val('');
			} else {
				if (parseFloat(str) > 1) {
					alert('p value cannot exceed 1.');
					$(this).val('');
				}
			}
		}
	})
	.focusin(function() {$('#zbox').val('');});

	$('#clear').click(function() {
		$('#zbox').val('');
		$('#pbox').val('');
		canvas.removeLayers();
		canvas.clearCanvas();
		drawAxises();
		drawCurve();
	});
	
	$('#compu').click(function() {
		if ($('#zbox').val() == '' && $('#pbox').val() == '') return;
		var tail = $("input:radio[name='tail']:checked").val();

		if ($('#zbox').val() != '') {
			var z = parseFloat($('#zbox').val());
			var p = pValue(z);
			if (tail == 'two') {
				p *= 2;
			} else if (tail == 'mid') {
				p = (1 - p * 2);
			}
			$('#pbox').val(formatNumber(p, 4));
		} else {
			var p = parseFloat($('#pbox').val());
			if (tail == 'two') {
				p /= 2;
			} else if (tail == 'mid') {
				p = (1 - p) / 2;
			}
			var z = zScore(p);
			$('#zbox').val(formatNumber(z, 3));
		}

		canvas.removeLayers();
		canvas.clearCanvas();


		var tail = $("input:radio[name='tail']:checked").val();
		if (tail == 'one') {
			if (z < 0) {
				shadeLeftTail(z);
			} else {
				shadeRightTail(z);
			}
		} else if (tail == 'two') {
			shadeLeftTail(z);
			shadeRightTail(Math.abs(z));
		} else {
			shadeMiddle(z);
		}
		drawAxises();
		drawCurve();
	});

	function drawAxises() {
		canvas.drawLine({
			layer: true,
			strokeStyle: '#00f',
			strokeWidth: 1,
			startArrow: true,
			endArrow: true,
			arrowRadius: 10,
			arrowAngle: 45,
			x1: 25, y1: 25,
			x2: 25, y2: 270,
			x3: 480, y3: 270
		});

		canvas.drawText({
			type: 'text',
			layer: true,
			fillStyle: '#00f',
			fontFamily: 'arial',
			fontStyle: 'italic',
			fontSize: 12,
			fromCenter: true,
			rotate: -90,
			text: 'prob. density',
			x: 15, y: 100
		})
		.drawText({
			type: 'text',
			layer: true,
			fillStyle: '#00f',
			fontFamily: 'arial',
			fontStyle: 'italic',
			fontSize: 12,
			fromCenter: true,
			text: 'z',
			x: 460, y: 280
		});

		for (var i=-4; i<=4; i++) {
			canvas.drawLine({
				layer: true,
				strokeStyle: '#00f',
				strokeWidth: 1,
				x1: 25+(i+5)*45, y1: 265,
				x2: 25+(i+5)*45, y2: 270
			})
			.drawText({
				layer: true,
				fillStyle: '#00f',
				fontFamily: 'arial',
				fontStyle: 'normal',
				fontSize: 12,
				fromCenter: true,
				type: 'text',
				text: i.toString(),
				x: gx(i), y: 280
			});
		}
	}

	function drawCurve() {
		var pts = [];
		var p = 0;
		for (var z=-4.00; z<4.01; z+=0.10) {
			p = density(z);
			var xy = new Array();
			xy[0] = gx(z);
			xy[1] = gy(p);
			pts.push(xy);
		}
		var curve = createLineLayer(pts, 'zcurve', '#f00', false, false);
		canvas.drawLine(curve);
	}

	function createLineLayer(points, lyrname, color, arrow1, arrow2) {
		var layer = {
			layer: true,
			name: lyrname,
			type: 'line',
			strokeStyle: color,
			strokeWidth: 2,
			startArrow: arrow1,
			endArrow: arrow2,
			arrowRadius: 10,
			arrowAngle: 45
		};

		for (var i=0; i<points.length; i++) {
			layer['x'+(i+1)] = points[i][0];
			layer['y'+(i+1)] = points[i][1];
		}
		return layer;
	}

	function createPolyLayer(points, lyrname, fillColor, borderColor) {
		var layer = {
			layer: true,
			name: lyrname,
			type: 'poly',
			fillStyle: fillColor,
			strokeStyle: borderColor,
			strokeWidth: 1,
			closed: true
		};

		for (var i=0; i<points.length; i++) {
			layer['x'+(i+1)] = points[i][0];
			layer['y'+(i+1)] = points[i][1];
		}
		return layer;
	}

	function gx(z) {
		return 250 + z * 45;
	}

	function gy(p) {
		return 270 - p * 500;
	}

	function density(z) {
		return 1 / (Math.pow(2.7182818284590451, (z * z / 2)) * 2.506628274631);   //2.5066... = Sqrt(3.1415926535... * 2)
	}

	function pValue(z) {
		z = Math.abs(z);
		if (z > 5) return 0;
		if (z == 0) return 0.5;

		var b = 0.0;       // b is half of the beta area
		var c = 0;
		for (var i = 0.0; i <= z-0.001; i += 0.001) {
			b += 0.001 * density(i + 0.0005);
			c += 1;
		}
		return 0.5 - b;
	}

	function zScore(pval) {
		if (pval <= 0.0) return Number.POSITIVE_INFINITY;
		if (pval >= 0.5) return 0;

		var b = 0.0;
		var i = 0.0;
		while (b + pval < 0.5) {
			b += 0.001 * density(i + 0.001 / 2);
			i += 0.001;
		}
		return i;
	}

	function shadeLeftTail(z) {
		if (z >= 4) return;
		z = Math.abs(z);

		var points = new Array();
		var p = 0.0;
		points.push(new Array(gx(-4), gy(0)));
		for (var i = -4.0; i < (-z); i += 0.1) {
			p = density(i);
			points.push(new Array(gx(i), gy(p)));
		}
		points.push(new Array(gx(-z), gy(density(z))));
		points.push(new Array(gx(-z), gy(0)));

		var poly = createPolyLayer(points, 'tail1', '#f88', null);
		canvas.drawLine(poly);
	}

	function shadeRightTail(z) {
		if (z >= 4) return;

		var points = new Array();
		var p = 0.0;
		points.push(new Array(gx(z), gy(0)));
		for (var i = z; i < 4; i += 0.1) {
			p = density(i);
			points.push(new Array(gx(i), gy(p)));
		}
		points.push(new Array(gx(4), gy(0)));

		var poly = createPolyLayer(points, 'tail2', '#f88', null);
		canvas.drawLine(poly);
	}

	function shadeMiddle(z) {
		if (z == 0) return;
		if (z > 4) z = 4;
		z = Math.abs(z);

		var points = new Array();
		var p = 0.0;

		points.push(new Array(gx(-z), gy(0)));
		for (var i = -z; i < z; i += 0.1) {
			p = density(i);
			points.push(new Array(gx(i), gy(p)));
		}
		points.push(new Array(gx(z), gy(density(z))));
		points.push(new Array(gx(z), gy(0)));

		var poly = createPolyLayer(points, 'tail3', '#f88', null);
		canvas.drawLine(poly);
	}

	function formatNumber(n, dd) {
		if (dd == 0) return Math.round(n);
		var p = Math.pow(10, dd);
		n = Math.round(n * p) / p;
		var str = n.toString();
		var x = str.indexOf('.');
		if (x < 0) {str += "."; x = str.length-1;}
		var d = str.length - x - 1;
		if (d < dd) {
			for (var i=d; i<dd; i++) {
				str += '0';
			}
		}
		return str;
	}

}
