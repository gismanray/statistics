$(document).ready(main);

function main(){
	var canvas = $('canvas');
	var _df = 2;
	var BLO = 0;
	var BHI = 15;
	var dx = 0.001;
	
	$('#two').attr('disabled', true);
	$('#mid').attr('disabled', true);
	$('#dfbox').val('5');
	$('#dbox').focus();
	drawAxises();
	drawCurve();

	$('#dbox').keyup(function() {
		var str = $(this).val();
		if (str == '.') return;
		if (str.length > 0) {
			if (isNaN(str)) {
				alert('Invalid number!\nTry again');
				$(this).val('');
			} else {
				if (parseFloat(str) > 1) {
					alert('K-S D cannot exceed 1.');
					$(this).val('');
				}				
			}
		}
	})
	.focusin(function() {$('#pbox').val('');});

	$('#pbox').keyup(function() {
		var str = $(this).val();
		if (str == '.') return;
		if (str.length > 0) {
			if (isNaN(str)) {
				alert('Invalid number!\nTry again');
				$(this).val('');
			} else {
				if (parseFloat(str) > 1) {
					alert('Probability cannot exceed 1.');
					$(this).val('');
				}
			}
		}
	})
	.focusin(function() {$('#dbox').val('');});
	
	$('#nbox').keyup(function() {
		var str = $(this).val();
		if (str.length > 0) {
			if (isNaN(str)) {
				alert('Invalid number!\nTry again');
				$(this).val(_df);
			}
		}
	});

	$('#clear').click(function() {
		$('#dbox').val('');
		$('#pbox').val('');
		$('.nbox').val('');
		canvas.removeLayers();
		canvas.clearCanvas();
		drawAxises();
		drawCurve();
	});

	$('#compu').click(function() {
		if ($('#dbox').val() == '' && $('#pbox').val() == '') return;
		if ($('#n1').val() == '' || $('#n2').val() == '') return;
		var n1 = parseInt($('#n1').val());
		var n2 = parseInt($('#n2').val());
		
		if ($('#dbox').val() != '') {
			var d = parseFloat($('#dbox').val());
			var x = 4*d*d*n1*n2/(n1+n2);
			var p = pRight(x);
			$('#pbox').val(formatNumber(p, 4));
		} else {
			var p = parseFloat($('#pbox').val());
			var x = xRight(p);
			var d = Math.sqrt(x*(n1+n2)/(4*n1*n2));
			$('#dbox').val(formatNumber(d, 3));
		}

		canvas.removeLayers();
		canvas.clearCanvas();
		shadeRightTail(x);
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
			text: String.fromCharCode(967),
			x: 460, y: 280
		})
		.drawText({
			layer: true,
			fillStyle: '#00f',
			fontFamily: 'arial',
			fontStyle: 'italic',
			fontSize: 10,
			fromCenter: true,
			type: 'text',
			text: '2',
			x: 468, y: 278
		});
		
		var s = 0;
		if (BHI - BLO >= 80)
			s = 20;
		else if (BHI - BLO >= 60)
			s = 10;
		else
			s = 5;

		for (var i=BLO; i<=BHI; i+=s) {
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
		
		if (BHI - BLO <= 100)
			dx = 0.01;
		else
			dx = 0.1;

		for (var x = BLO; x <= BHI; x += dx) {
			p = density(x);
			pts.push(new Array(gx(x), gy(p)));
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

	function gx(x) {
		var f = 400 / (BHI - BLO);
		return (x - BLO) * f + 25;
	}

	function gy(p) {
		return 270 - p * 200 / density(_df - 2);
	}

	function density(x) {
		return Math.exp(-x / 2) * Math.pow(x, _df / 2 - 1) / (Math.pow(2, _df / 2) * gamm(_df / 2));
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
	
	function gammr(v, x) {
		var r = 0.0;
		for (var t=0; t<=x; t+=dx) {
			r += Math.pow(t, v-1) * Math.exp(-t) * dx;
		}
		return r;
	}

	function beta(t, w) {
		return Math.exp(gammln(t) + gammln(w) - gammln(t + w));
	}

	function pLeft(x) {
		if (x <= 0) return 0;
		return gammr(_df/2, x/2) / gamm(_df/2);
	}
	
	function pRight(x) {
		if (_df > 2) {
			return 1 - pLeft(x);
		} else {
			var a = 0.0;
			for (var i=x; i<BHI*2; i+=dx) {
				a += density(i) * dx;
			}
			return a;
		}
	}

	function xLeft(pval) {
		if (pval <= 0)
			return 0;
		else if (pval >= 1)
			return Number.POSITIVE_INFINITY;
		
		var a = 0.0;
		for (var i=BLO; i<=BHI*2; i+=dx) {
			a += density(i) * dx;
			if (a >= pval) return i;
		}
	}
	
	function xRight(pval) {
		if (_df > 2) {
			return xLeft(1 - pval);
		} else {
			var a = 0.0;
			for (var i=BHI*2; i>BLO; i-=dx) {
				a += density(i) * dx;
				if (a >= pval) return i;
			}
		}
	}

	function shadeLeftTail(x) {
		if (x >= BLO) return;

		var points = new Array();
		var p = 0.0;
		points.push(new Array(gx(BLO), gy(0)));
		for (var i = BLO; i < x; i += 0.1) {
			p = density(i);
			points.push(new Array(gx(i), gy(p)));
		}
		points.push(new Array(gx(x), gy(density(x))));
		points.push(new Array(gx(x), gy(0)));

		var poly = createPolyLayer(points, 'tail1', '#f88', null);
		canvas.drawLine(poly);
	}

	function shadeRightTail(x) {
		if (x >= BHI) return;

		var points = new Array();
		var p = 0.0;
		points.push(new Array(gx(x), gy(0)));
		for (var i = x; i < BHI; i += 0.1) {
			p = density(i);
			points.push(new Array(gx(i), gy(p)));
		}
		points.push(new Array(gx(BHI), gy(0)));

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
