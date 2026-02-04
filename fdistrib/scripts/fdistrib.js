$(document).ready(main);

function main(){
	var canvas = $('canvas');
	var _df1 = 10, _df2 = 10;
	var INF = 7;
	
	$('#mid').attr('disabled', 'true');
	$('.dfbox').val('10');
	$('#fbox').focus();
	drawAxises();
	drawCurve();


	$('#fbox').keyup(function() {
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
					alert('p-value cannot be greater than 1.');
					$(this).val('');
				}
			}
		}
	})
	.focusin(function() {$('#fbox').val('');});
	
	$('.dfbox').keyup(function() {
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
				_df1 = parseInt($('#df1').val());
				if (_df1 > 120) _df1 = 120;
				
				_df2 = parseInt($('#df2').val());
				if (_df2 > 120) _df2 = 120;
				
				INF = 12 - Math.round(Math.log(_df1 * _df2));
				
				canvas.removeLayers();
				canvas.clearCanvas();
				drawAxises();
				drawCurve();
			}
		}
	});

	$('#clear').click(function() {
		$('#fbox').val('');
		$('#pbox').val('');
		canvas.removeLayers();
		canvas.clearCanvas();
		drawAxises();
		drawCurve();
	});

	$('#compu').click(function() {
		if ($('#fbox').val() == '' && $('#pbox').val() == '') return;
		var tail = $("input:radio[name='tail']:checked").val();

		canvas.removeLayers();
		canvas.clearCanvas();

		if ($('#fbox').val() != '') {
			var f = parseFloat($('#fbox').val());
			var p = 0.0;
			if (f < 1)
				p = pLeft(f);
			else
				p = pRight(f);

			if (tail == 'one') {
				//$('#pbox').val(Math.round(p*10000)/10000);
				$('#pbox').val(formatNumber(p, 4));
				if (f < 1)
					shadeLeftTail(f);
				else
					shadeRightTail(f);
			} else {
				$('#pbox').val(formatNumber(p*2, 4));
				if (f < 1) {
					shadeLeftTail(f);
					shadeRightTail(1/f);
				} else {
					shadeRightTail(f);
					shadeLeftTail(1/f);
				}
			}
		
		} else {
			var p = parseFloat($('#pbox').val());
			if (tail == 'one') {
				if (p < 1)
					var f = fRight(p);
				else
					var f = 0;
				if (f == Number.POSITIVE_INFINITY)
					$('#fbox').val(f);
				else
					$('#fbox').val(formatNumber(f, 3));
				shadeRightTail(f);
			} else {
				if (p > 1) p = 1;
				var f2 = fRight(p / 2);
				if (f2 == Number.POSITIVE_INFINITY)
					$('#fbox').val(f2);
				else
					$('#fbox').val(formatNumber(f2, 3));
				shadeRightTail(f2);
				
				var f1 = fLeft(p / 2);
				shadeLeftTail(f1);
			}
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

		for (var i=0; i<=INF; i++) {
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
		for (var z=0; z<INF; z+=0.01) {
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

	function gx(f) {
		//return 250 + t * 45;
		var r = 400 / INF;
		return f * r + 25;
	}

	function gy(p) {
		//return 270 - p * 500;
		return 270 - p * (350 - Math.log(_df1 * _df2) * 25);
	}

	function density(f) {
		return (gamm((_df1 + _df2) / 2) * Math.pow((_df1 / _df2), (_df1 / 2)) * Math.pow(f, (_df1 / 2 - 1))) / (gamm(_df1 / 2) * gamm(_df2 / 2) * Math.pow((1 + _df1 * f / _df2), ((_df1 + _df2) / 2)));
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

	function beta(z, w) {
		return Math.exp(gammln(z) + gammln(w) - gammln(z + w));
	}

	function pLeft(f) {
		if (f <= 0) return 0;
		var a = 0.0;
		for (var i = f; i >= 0; i -= 0.001) {
                a += 0.001 * density(i - 0.0005);
		}
		return a;
	}
	
	function pRight(f) {
		var a = 0.0;
		for (var i = f; i <= INF * 5; i += 0.001) {
			a += 0.001 * density(i + 0.0005);
		}
		return a;
	}

	function fLeft(pLeft) {
		if (pLeft <= 0) return 0;
		var a = 0.0;
		for (var i = 0; i <= INF; i += 0.001) {
			a += density(i) * 0.001;
			if (a >= pLeft) return i;
		}
	}

	function fRight(pRight) {
		if (pRight <= 0) return Number.POSITIVE_INFINITY;
		var a = 0.0;
		for (var i = INF * 5; i >= 0; i -= 0.001) {
			a += density(i) * 0.001;
			if (a >= pRight) {
				return i;
			}
		}
	}

	function shadeLeftTail(f) {
		if (f >= INF) return;
		f = Math.abs(f);

		var points = new Array();
		var p = 0.0;
		points.push(new Array(gx(0), gy(0)));
		for (var i = 0; i < f; i += 0.01) {
			p = density(i);
			points.push(new Array(gx(i), gy(p)));
		}
		points.push(new Array(gx(f), gy(density(f))));
		points.push(new Array(gx(f), gy(0)));

		var poly = createPolyLayer(points, 'tail1', '#f88', null);
		canvas.drawLine(poly);
	}

	function shadeRightTail(f) {
		if (f >= INF) return;

		var points = new Array();
		var p = 0.0;
		points.push(new Array(gx(f), gy(0)));
		for (var i = f; i < INF; i += 0.01) {
			p = density(i);
			points.push(new Array(gx(i), gy(p)));
		}
		points.push(new Array(gx(INF), gy(0)));

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
