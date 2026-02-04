$(document).ready(main);

function main(){
	var canvas = $('canvas');
	var _df = 10;
	var INF = 5;
	
	$('#dfbox').val('10');
	$('#tbox').focus();
	drawAxises();
	drawCurve();

	$('#tbox').keyup(function() {
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
	.focusin(function() {$('#tbox').val('');});
	
	$('#dfbox').keyup(function() {
		var str = $(this).val();
		if (str.length > 0) {
			if (isNaN(str)) {
				alert('Invalid number!\nTry again');
				$(this).val('');
			} else {
				if (parseInt(str) == 0) {
					$(this).val(_df);
					alert('Degree of freedom must be greater than zero.');
					return;
				}
				_df = parseInt(str);
				if (_df > 340) _df = 340;
				if (_df >= 10) {
					INF = 5;
				} else if (_df >= 5) {
					INF = 6;
				} else {
					INF = 11 - _df;
				}
				
				canvas.removeLayers();
				canvas.clearCanvas();
				drawAxises();
				drawCurve();
			}
		}
	});

	$('#clear').click(function() {
		$('#tbox').val('');
		$('#pbox').val('');
		canvas.removeLayers();
		canvas.clearCanvas();
		drawAxises();
		drawCurve();
	});

	$('#compu').click(function() {
		if ($('#tbox').val() == '' && $('#pbox').val() == '') return;
		var tail = $("input:radio[name='tail']:checked").val();

		if ($('#tbox').val() != '') {
			var t = parseFloat($('#tbox').val());
			var p = pValue(t);
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
			var t = tScore(p);
			$('#tbox').val(formatNumber(t, 3));
		}

		canvas.removeLayers();
		canvas.clearCanvas();

		if (tail == 'one') {
			if (t < 0) {
				shadeLeftTail(t);
			} else {
				shadeRightTail(t);
			}
		} else if (tail == 'two') {
			shadeLeftTail(t);
			shadeRightTail(Math.abs(t));
		} else {
			shadeMiddle(t);
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
			text: 't',
			x: 460, y: 280
		});

		for (var i=-INF; i<=INF; i++) {
			canvas.drawLine({
				layer: true,
				strokeStyle: '#00f',
				strokeWidth: 1,
				x1: gx(i), y1: 265,
				x2: gx(i), y2: 270
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
		for (var t=-INF; t<INF; t+=0.10) {
			p = density(t);
			var xy = new Array();
			xy[0] = gx(t);
			xy[1] = gy(p);
			pts.push(xy);
		}
		var curve = createLineLayer(pts, 'tcurve', '#f00', false, false);
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

	function gx(t) {
		//return 250 + t * 45;
		var f = 200 / INF;
		var shift = 25 + (INF - 5) * f;
		return Math.round((t + 5) * f + shift);
	}

	function gy(p) {
		return 270 - p * 500;
	}

	function density(t) {
		if (_df >= 340)
			return 1 / (Math.pow(2.7182818284590451, (t * t / 2)) * 2.506628274631);
		else {
			var PI = 3.1415926535897931
			return gamm((_df + 1) / 2) * Math.pow((1 + t * t / _df), (-(_df + 1) / 2)) / (Math.sqrt(_df * PI) * gamm(_df / 2)) 
		}
	}

	function gammln(xx) {
		var x = 0.0, y = 0.0, tmp = 0.0, ser = 0.0;
		var cof = [76.180091729471457, -86.505320329416776, 24.014098240830911, -1.231739572450155, 0.001208650973866179, -0.000005395239384953];

		x = xx;
		y = xx;
		tmp = x + 5.5;
		tmp -= (x + 0.5) * Math.log(tmp);
		ser = 1.0000000001900149;
		for (var j = 0; j <= 5; j++) {
			y += 1;
			ser += cof[j] / y;
		}
		return Math.log(2.5066282746310007 * ser / x) -tmp ;
	}

	function gamm(x) {
		return Math.exp(gammln(x));
	}

	function beta(t, w) {
		return Math.exp(gammln(t) + gammln(w) - gammln(t + w));
	}

	function pValue(t) {
		t = Math.abs(t);
		if (t > INF) return 0;
		if (t == 0) return 0.5;

		var b = 0.0;       // b is half of the beta area
		var c = 0;
		for (var i = 0.0; i <= t-0.001; i += 0.001) {
			b += 0.001 * density(i + 0.0005);
			c += 1;
		}
		return 0.5 - b;
	}

	function tScore(pval) {
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

	function shadeLeftTail(t) {
		if (t >= INF) return;
		t = Math.abs(t);

		var points = new Array();
		var p = 0.0;
		points.push(new Array(gx(-INF), gy(0)));
		for (var i = -INF; i < (-t); i += 0.1) {
			p = density(i);
			points.push(new Array(gx(i), gy(p)));
		}
		points.push(new Array(gx(-t), gy(density(t))));
		points.push(new Array(gx(-t), gy(0)));

		var poly = createPolyLayer(points, 'tail1', '#f88', null);
		canvas.drawLine(poly);
	}

	function shadeRightTail(t) {
		if (t >= INF) return;

		var points = new Array();
		var p = 0.0;
		points.push(new Array(gx(t), gy(0)));
		for (var i = t; i < INF; i += 0.1) {
			p = density(i);
			points.push(new Array(gx(i), gy(p)));
		}
		points.push(new Array(gx(INF), gy(0)));

		var poly = createPolyLayer(points, 'tail2', '#f88', null);
		canvas.drawLine(poly);
	}

	function shadeMiddle(t) {
		if (t == 0) return;
		if (t > INF) t = INF;
		t = Math.abs(t);

		var points = new Array();
		var p = 0.0;

		points.push(new Array(gx(-t), gy(0)));
		for (var i = -t; i < t; i += 0.1) {
			p = density(i);
			points.push(new Array(gx(i), gy(p)));
		}
		points.push(new Array(gx(t), gy(density(t))));
		points.push(new Array(gx(t), gy(0)));

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
