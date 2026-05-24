---
title: "The Quake III Inverse Square Root Story"
description: "A small article on fast inverse square root, Newton refinement inspired by the magic trick in Quake III Arena."
date: 2026-05-20
updated: 2026-05-20
draft: false
tags: ["precision","optimization","fast","story"]
generated: true
source: "blog/notebooks/the-quake3-inverse-square-root-story.ipynb"
notebook: "the-quake3-inverse-square-root-story.ipynb"
sourceMtimeMs: 1779280621883.6409
sourceHash: "fc46782bda3896d610ce7995b1657fa15adb83490bd080a02996c1d000bd69ad"
generator: "quarto-html"
bibliography: [{"author":"id Software","id":"quake","title":"Quake III Arena source code, q_math.c","url":"https://github.com/id-Software/Quake-III-Arena/blob/dbe4ddb10315479fc00086f08e25d968b4b43c49/code/game/q_math.c#L561","year":"1999"}]
aliases: ["/quake-rsqrt"]
featured: true
---
<p>Today, I would like to revisit the story behind one of the most famous low-level optimization tricks in video game history: the fast inverse square root implementation used in Quake III Arena.</p>
<p>As visible in the original source code from id Software’s <a href="https://github.com/id-Software/Quake-III-arena/blob/master/code/game/q_math.c#L561" target="_blank" rel="noopener noreferrer">Quake III fast inverse square root source code</a>, a particularly unusual function named <code>Q_rsqrt</code> appears in the file <code>q_math.c</code>. This function takes a floating-point value as input and approximates its inverse square root:</p>
<p><math display="block" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>q</mi><mo>=</mo><mfrac><mn>1</mn><msqrt><mi>x</mi></msqrt></mfrac><mo>=</mo><msup><mi>x</mi><mrow><mi>−</mi><mn>1</mn><mi>/</mi><mn>2</mn></mrow></msup></mrow><annotation encoding="application/x-tex">
q = \frac{1}{\sqrt{x}} = x^{-1/2}
</annotation></semantics></math></p>
<p>At first glance, computing an inverse square root may seem oddly specific. However, this operation is fundamental in computer graphics and real-time physics simulation because it appears constantly during vector normalization. Given a vector <math display="inline" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mi>𝐱</mi><annotation encoding="application/x-tex">\mathbf{x}</annotation></semantics></math>, its normalized form with unitary length is defined as:</p>
<p><math display="block" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mover><mi>𝐱</mi><mo accent="true">̂</mo></mover><mo>=</mo><mfrac><mi>𝐱</mi><mrow><mo stretchy="false" form="postfix">∥</mo><mi>𝐱</mi><msub><mo stretchy="false" form="postfix">∥</mo><mn>2</mn></msub></mrow></mfrac></mrow><annotation encoding="application/x-tex">
\hat{\mathbf{x}} = \frac{\mathbf{x}}{\|\mathbf{x}\|_2}
</annotation></semantics></math></p>
<p>Computing the Euclidean norm <math display="inline" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false" form="prefix">|</mo><mo stretchy="false" form="prefix">|</mo><mi>𝐱</mi><msub><mo stretchy="false" form="postfix">∥</mo><mn>2</mn></msub></mrow><annotation encoding="application/x-tex">||\mathbf{x}\|_2</annotation></semantics></math> requires a square root, and normalization additionally requires a division. In the context of real-time 3D rendering, especially during the late 1990s where floating-point hardware was significantly slower than today, these operations were computationally expensive.</p>
<p>Game engines such as those powering Quake III Arena relied heavily on geometric computations involving Euclidean spaces, rotations, lighting, collision detection, and camera transformations. As a consequence, inverse square root evaluations were performed extremely frequently, often millions of times per second.</p>
<p>The main story, however, lies in the remarkable trick used inside the Quake III implementation of this inverse square root function. As famously known, even the original source code itself seemed to express surprise at the method being used, with the legendary comment:</p>
<div class="code-copy-outer-scaffold"><div class="sourceCode" id="cb1"><pre><code class="sourceCode c"><span id="cb1-1"><a href="#cb1-1" aria-hidden="true" tabindex="-1"></a><span class="co">// what the fuck?</span></span></code></pre></div></div>
<p>written directly by one of the developers next to the infamous line involving the constant:</p>
<p><math display="inline" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>0</mn><mi>x</mi><mn>5</mn><mi>f</mi><mn>3759</mn><mi>d</mi><mi>f</mi><mspace width="0.222em"></mspace><mo>≈</mo><mn>1597463007</mn></mrow><annotation encoding="application/x-tex">0x5f3759df~\approx 1597463007</annotation></semantics></math> in integer representation.</p>
<p>At first sight, this hexadecimal value appears completely arbitrary and almost magical. Yet, behind this mysterious constant lies a clever mathematical approximation exploiting the structure of IEEE-754 floating-point representations.</p>
<p>In the following sections, we will progressively uncover how this constant was derived, why manipulating the bit representation of a floating-point number approximates a logarithmic transform, and how this seemingly obscure trick provides an efficient initial estimate for the inverse square root problem.</p>
<section id="the-ieee-754-float-representation" class="level1">
<h1>The IEEE-754 float representation</h1>
<p>To firstly understand where this magical constant comes from, we must revisit the IEEE-754 floating-point representation used by modern computers to encode real numbers. This binary representation allows both integer and fractional values to be stored efficiently inside a fixed number of bits while preserving a very large dynamic range.</p>
<p>The IEEE-754 standard defines how floating-point numbers are represented, rounded, and manipulated at the hardware level. In the case of a 32-bit single-precision float, the number is decomposed into three distinct fields:</p>
<ul>
<li>1 sign bit <math display="inline" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mi>s</mi><annotation encoding="application/x-tex">s</annotation></semantics></math>,</li>
<li>8 exponent bits <math display="inline" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mi>E</mi><annotation encoding="application/x-tex">E</annotation></semantics></math>,</li>
<li>23 mantissa (fraction) bits <math display="inline" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mi>M</mi><annotation encoding="application/x-tex">M</annotation></semantics></math>.</li>
</ul>
<p>The encoded value is interpreted as:</p>
<p><math display="block" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>x</mi><mo>=</mo><mo stretchy="false" form="prefix">(</mo><mi>−</mi><mn>1</mn><msup><mo stretchy="false" form="postfix">)</mo><mi>s</mi></msup><mo>⋅</mo><mo stretchy="false" form="prefix">(</mo><mn>1</mn><mo>+</mo><mfrac><mi>M</mi><msup><mn>2</mn><mn>23</mn></msup></mfrac><mo stretchy="false" form="postfix">)</mo><mo>⋅</mo><msup><mn>2</mn><mrow><mi>E</mi><mo>−</mo><mn>127</mn></mrow></msup></mrow><annotation encoding="application/x-tex">
x = (-1)^s \cdot (1 +  \frac{M}{2^{23}}) \cdot 2^{E - 127}
</annotation></semantics></math></p>
<p>The exponent is therefore stored using a biased representation with bias <math display="inline" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mn>127</mn><annotation encoding="application/x-tex">127</annotation></semantics></math>. The bits coming from <math display="inline" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mi>s</mi><annotation encoding="application/x-tex">s</annotation></semantics></math>, <math display="inline" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mi>E</mi><annotation encoding="application/x-tex">E</annotation></semantics></math> and <math display="inline" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mi>M</mi><annotation encoding="application/x-tex">M</annotation></semantics></math> are concatenated and stored to represent the real underlying value.</p>
<p>For example, the float <math display="inline" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mn>6.5</mn><annotation encoding="application/x-tex">6.5</annotation></semantics></math> is represented as:</p>
<p><math display="block" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>6.5</mn><mo>=</mo><mo stretchy="false" form="prefix">(</mo><mn>1</mn><mo>+</mo><mn>0.625</mn><mo stretchy="false" form="postfix">)</mo><mo>×</mo><msup><mn>2</mn><mrow><mn>129</mn><mo>−</mo><mn>127</mn></mrow></msup></mrow><annotation encoding="application/x-tex">
6.5 = (1 + 0.625) \times 2^{129-127}
</annotation></semantics></math> Since the number is positive, the sign bit is: <math display="block" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>s</mi><mo>=</mo><mn>0</mn></mrow><annotation encoding="application/x-tex">
s = 0
</annotation></semantics></math> The biased exponent is: <math display="block" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>E</mi><mo>=</mo><mn>2</mn><mo>+</mo><mn>127</mn><mo>=</mo><mn>129</mn><mo>=</mo><mo stretchy="false" form="prefix">(</mo><mn>10000001</mn><msub><mo stretchy="false" form="postfix">)</mo><mn>2</mn></msub></mrow><annotation encoding="application/x-tex">
E = 2 + 127 = 129 = (10000001)_2
</annotation></semantics></math> The significand is: <math display="block" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>1</mn><mo>+</mo><mi>m</mi><mo>=</mo><mn>1.625</mn><mo>=</mo><mo stretchy="false" form="prefix">(</mo><mn>1.101</mn><msub><mo stretchy="false" form="postfix">)</mo><mn>2</mn></msub></mrow><annotation encoding="application/x-tex">
1+m = 1.625 = (1.101)_2
</annotation></semantics></math> therefore: <math display="block" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>m</mi><mo>=</mo><mn>0.625</mn><mo>=</mo><mo stretchy="false" form="prefix">(</mo><mn>0.101</mn><msub><mo stretchy="false" form="postfix">)</mo><mn>2</mn></msub></mrow><annotation encoding="application/x-tex">
m = 0.625 = (0.101)_2
</annotation></semantics></math></p>
<p>In IEEE-754 single precision, the leading <math display="inline" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mn>1</mn><annotation encoding="application/x-tex">1</annotation></semantics></math> is implicit, therefore only the fractional part is stored: <math display="block" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>m</mi><mo>=</mo><mn>10100000000000000000000</mn></mrow><annotation encoding="application/x-tex">
m = 10100000000000000000000
</annotation></semantics></math></p>
<p>Hence, the 32-bit floating-point representation is obtained by concatenating the sign bit, exponent field, and mantissa field:</p>
<p><math display="block" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false" form="prefix">|</mo><mi>s</mi><mo stretchy="false" form="prefix">|</mo><mi>E</mi><mo stretchy="false" form="prefix">|</mo><mi>m</mi><mo stretchy="false" form="prefix">|</mo><mo>=</mo><mo stretchy="false" form="prefix">(</mo><mn>0</mn><msub><mo stretchy="false" form="postfix">)</mo><mn>2</mn></msub><mo stretchy="false" form="prefix">(</mo><mn>10000001</mn><msub><mo stretchy="false" form="postfix">)</mo><mn>2</mn></msub><mo stretchy="false" form="prefix">(</mo><mn>10100000000000000000000</mn><msub><mo stretchy="false" form="postfix">)</mo><mn>2</mn></msub><mo>=</mo><mo stretchy="false" form="prefix">(</mo><mn>01000000110100000000000000000000</mn><msub><mo stretchy="false" form="postfix">)</mo><mn>2</mn></msub></mrow><annotation encoding="application/x-tex">
|s|E|m|
=
(0)_2
(10000001)_2
(10100000000000000000000)_2
=
(01000000110100000000000000000000)_2
</annotation></semantics></math></p>
<p>or equivalently in hexadecimal:</p>
<p><math display="block" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mtext mathvariant="monospace">𝟶𝚡𝟺𝟶𝙳𝟶𝟶𝟶𝟶𝟶</mtext><mo>=</mo><msub><mn>1087373312</mn><mn>10</mn></msub></mrow><annotation encoding="application/x-tex">
\texttt{0x40D00000} = 1087373312_{10}
</annotation></semantics></math></p>
<p>This is how a representable floating-point value is encoded on 32 bits. From this representation, one can derive the maximum finite value, the smallest positive normal value, spacing between adjacent representable values, and other information encoded by the format.</p>
</section>
<section id="the-quake-3-trick" class="level1">
<h1>The Quake 3 Trick</h1>
<p>The key idea behind the Quake 3 trick is that the integer representation of a floating-point number behaves approximately like an affine transform of its binary logarithm.</p>
<p>More generally, let <math display="inline" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>x</mi><mi>f</mi></msub><mo>&gt;</mo><mn>0</mn></mrow><annotation encoding="application/x-tex">x_f &gt; 0</annotation></semantics></math> be a normalized IEEE-754 float:</p>
<p><math display="block" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>x</mi><mi>f</mi></msub><mo>=</mo><mo stretchy="false" form="prefix">(</mo><mn>1</mn><mo>+</mo><mi>m</mi><mo stretchy="false" form="postfix">)</mo><msup><mn>2</mn><mrow><mi>E</mi><mo>−</mo><mn>127</mn></mrow></msup></mrow><annotation encoding="application/x-tex">
x_f = (1+m)2^{E-127}
</annotation></semantics></math></p>
<p>where:</p>
<ul>
<li><math display="inline" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>m</mi><mo>∈</mo><mo stretchy="false" form="prefix">[</mo><mn>0</mn><mo>,</mo><mn>1</mn><mo stretchy="false" form="postfix">)</mo></mrow><annotation encoding="application/x-tex">m \in [0,1)</annotation></semantics></math> is the fractional mantissa,</li>
<li><math display="inline" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mi>E</mi><annotation encoding="application/x-tex">E</annotation></semantics></math> is the biased exponent field.</li>
</ul>
<p>Taking the binary logarithm gives:</p>
<p><math display="block" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mrow><mi mathvariant="normal">log</mi><mo>⁡</mo></mrow><mn>2</mn></msub><mo stretchy="false" form="prefix">(</mo><msub><mi>x</mi><mi>f</mi></msub><mo stretchy="false" form="postfix">)</mo><mo>=</mo><msub><mrow><mi mathvariant="normal">log</mi><mo>⁡</mo></mrow><mn>2</mn></msub><mo stretchy="false" form="prefix">(</mo><mn>1</mn><mo>+</mo><mi>m</mi><mo stretchy="false" form="postfix">)</mo><mo>+</mo><mi>E</mi><mo>−</mo><mn>127</mn><mi>.</mi></mrow><annotation encoding="application/x-tex">
\log_2(x_f)
=
\log_2(1+m) + E - 127.
</annotation></semantics></math></p>
<p>Now let <math display="inline" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mi>M</mi><annotation encoding="application/x-tex">M</annotation></semantics></math> denote the 23-bit mantissa field interpreted as an integer:</p>
<p><math display="block" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>m</mi><mo>=</mo><mfrac><mi>M</mi><msup><mn>2</mn><mn>23</mn></msup></mfrac><mi>.</mi></mrow><annotation encoding="application/x-tex">
m = \frac{M}{2^{23}}.
</annotation></semantics></math></p>
<p>For positive normalized floats with sign bit zero, the 32-bit float bit pattern reinterpreted as an unsigned integer is therefore:</p>
<p><math display="block" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>x</mi><mi>i</mi></msub><mo>=</mo><mi>E</mi><mo>⋅</mo><msup><mn>2</mn><mn>23</mn></msup><mo>+</mo><mi>M</mi><mi>.</mi></mrow><annotation encoding="application/x-tex">
x_i = E \cdot 2^{23} + M.
</annotation></semantics></math></p>
<p>Substituting <math display="inline" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>M</mi><mo>=</mo><mi>m</mi><msup><mn>2</mn><mn>23</mn></msup></mrow><annotation encoding="application/x-tex">M = m2^{23}</annotation></semantics></math> gives:</p>
<p><math display="block" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>x</mi><mi>i</mi></msub><mo>=</mo><msup><mn>2</mn><mn>23</mn></msup><mo stretchy="false" form="prefix">(</mo><mi>E</mi><mo>+</mo><mi>m</mi><mo stretchy="false" form="postfix">)</mo><mo>,</mo></mrow><annotation encoding="application/x-tex">
x_i
=
2^{23}(E+m),
</annotation></semantics></math></p>
<p>or equivalently:</p>
<p><math display="block" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mfrac><msub><mi>x</mi><mi>i</mi></msub><msup><mn>2</mn><mn>23</mn></msup></mfrac><mo>=</mo><mi>E</mi><mo>+</mo><mi>m</mi><mi>.</mi></mrow><annotation encoding="application/x-tex">
\frac{x_i}{2^{23}}
=
E+m.
</annotation></semantics></math></p>
<p>At this point, one must be careful. The logarithmic term satisfies the local first-order approximation:</p>
<p><math display="block" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mrow><mi mathvariant="normal">log</mi><mo>⁡</mo></mrow><mn>2</mn></msub><mo stretchy="false" form="prefix">(</mo><mn>1</mn><mo>+</mo><mi>m</mi><mo stretchy="false" form="postfix">)</mo><mo>=</mo><mfrac><mrow><mrow><mi mathvariant="normal">ln</mi><mo>⁡</mo></mrow><mo stretchy="false" form="prefix">(</mo><mn>1</mn><mo>+</mo><mi>m</mi><mo stretchy="false" form="postfix">)</mo></mrow><mrow><mrow><mi mathvariant="normal">ln</mi><mo>⁡</mo></mrow><mn>2</mn></mrow></mfrac><mo>≈</mo><mfrac><mi>m</mi><mrow><mrow><mi mathvariant="normal">ln</mi><mo>⁡</mo></mrow><mn>2</mn></mrow></mfrac><mspace width="2.0em"></mspace><mrow><mtext mathvariant="normal">for small </mtext><mspace width="0.333em"></mspace></mrow><mi>m</mi><mi>.</mi></mrow><annotation encoding="application/x-tex">
\log_2(1+m)
=
\frac{\ln(1+m)}{\ln 2}
\approx
\frac{m}{\ln 2}
\qquad \text{for small } m.
</annotation></semantics></math></p>
<p>Therefore,</p>
<p><math display="block" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mrow><mi mathvariant="normal">log</mi><mo>⁡</mo></mrow><mn>2</mn></msub><mo stretchy="false" form="prefix">(</mo><msub><mi>x</mi><mi>f</mi></msub><mo stretchy="false" form="postfix">)</mo><mo>≈</mo><mfrac><mi>m</mi><mrow><mrow><mi mathvariant="normal">ln</mi><mo>⁡</mo></mrow><mn>2</mn></mrow></mfrac><mo>+</mo><mi>E</mi><mo>−</mo><mn>127</mn><mi>.</mi></mrow><annotation encoding="application/x-tex">
\log_2(x_f)
\approx
\frac{m}{\ln 2}
+
E
-
127.
</annotation></semantics></math></p>
<p>Using</p>
<p><math display="block" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>E</mi><mo>=</mo><mfrac><msub><mi>x</mi><mi>i</mi></msub><msup><mn>2</mn><mn>23</mn></msup></mfrac><mo>−</mo><mi>m</mi><mo>,</mo></mrow><annotation encoding="application/x-tex">
E
=
\frac{x_i}{2^{23}} - m,
</annotation></semantics></math></p>
<p>we obtain:</p>
<p><math display="block" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mrow><mi mathvariant="normal">log</mi><mo>⁡</mo></mrow><mn>2</mn></msub><mo stretchy="false" form="prefix">(</mo><msub><mi>x</mi><mi>f</mi></msub><mo stretchy="false" form="postfix">)</mo><mo>≈</mo><mfrac><msub><mi>x</mi><mi>i</mi></msub><msup><mn>2</mn><mn>23</mn></msup></mfrac><mo>−</mo><mn>127</mn><mo>+</mo><mi>m</mi><mrow><mo stretchy="true" form="prefix">(</mo><mfrac><mn>1</mn><mrow><mrow><mi mathvariant="normal">ln</mi><mo>⁡</mo></mrow><mn>2</mn></mrow></mfrac><mo>−</mo><mn>1</mn><mo stretchy="true" form="postfix">)</mo></mrow><mi>.</mi></mrow><annotation encoding="application/x-tex">
\log_2(x_f)
\approx
\frac{x_i}{2^{23}}
-
127
+
m\left(\frac{1}{\ln 2}-1\right).
</annotation></semantics></math></p>
<p>Equivalently,</p>
<p><math display="block" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>x</mi><mi>i</mi></msub><mo>≈</mo><msup><mn>2</mn><mn>23</mn></msup><mrow><mo stretchy="true" form="prefix">(</mo><msub><mrow><mi mathvariant="normal">log</mi><mo>⁡</mo></mrow><mn>2</mn></msub><mo stretchy="false" form="prefix">(</mo><msub><mi>x</mi><mi>f</mi></msub><mo stretchy="false" form="postfix">)</mo><mo>+</mo><mn>127</mn><mo>−</mo><mi>m</mi><mrow><mo stretchy="true" form="prefix">(</mo><mfrac><mn>1</mn><mrow><mrow><mi mathvariant="normal">ln</mi><mo>⁡</mo></mrow><mn>2</mn></mrow></mfrac><mo>−</mo><mn>1</mn><mo stretchy="true" form="postfix">)</mo></mrow><mo stretchy="true" form="postfix">)</mo></mrow><mi>.</mi></mrow><annotation encoding="application/x-tex">
x_i
\approx
2^{23}
\left(
\log_2(x_f)
+
127
-
m\left(\frac{1}{\ln 2}-1\right)
\right).
</annotation></semantics></math></p>
<p>The correction term <math display="inline" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>m</mi><mrow><mo stretchy="true" form="prefix">(</mo><mfrac><mn>1</mn><mrow><mrow><mi mathvariant="normal">ln</mi><mo>⁡</mo></mrow><mn>2</mn></mrow></mfrac><mo>−</mo><mn>1</mn><mo stretchy="true" form="postfix">)</mo></mrow></mrow><annotation encoding="application/x-tex">m\left(\frac{1}{\ln 2}-1\right)</annotation></semantics></math> comes from the fact that the mantissa field stores <math display="inline" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mi>m</mi><annotation encoding="application/x-tex">m</annotation></semantics></math>, whereas the local linearization of <math display="inline" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mrow><mi mathvariant="normal">log</mi><mo>⁡</mo></mrow><mn>2</mn></msub><mo stretchy="false" form="prefix">(</mo><mn>1</mn><mo>+</mo><mi>m</mi><mo stretchy="false" form="postfix">)</mo></mrow><annotation encoding="application/x-tex">\log_2(1+m)</annotation></semantics></math> has slope <math display="inline" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>1</mn><mi>/</mi><mrow><mi mathvariant="normal">ln</mi><mo>⁡</mo></mrow><mn>2</mn></mrow><annotation encoding="application/x-tex">1/\ln 2</annotation></semantics></math>, not <math display="inline" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mn>1</mn><annotation encoding="application/x-tex">1</annotation></semantics></math>.</p>
<p>Since <math display="block" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mfrac><mn>1</mn><mrow><mrow><mi mathvariant="normal">ln</mi><mo>⁡</mo></mrow><mn>2</mn></mrow></mfrac><mo>−</mo><mn>1</mn><mo>=</mo><munder><mi mathvariant="normal">max</mi><mrow><mi>x</mi><mo>∈</mo><mo stretchy="false" form="prefix">[</mo><mn>0</mn><mo>,</mo><mn>1</mn><mo stretchy="false" form="postfix">)</mo></mrow></munder><mo stretchy="false" form="prefix">(</mo><mi>x</mi><mo>−</mo><msub><mrow><mi mathvariant="normal">log</mi><mo>⁡</mo></mrow><mn>2</mn></msub><mo stretchy="false" form="prefix">(</mo><mn>1</mn><mo>+</mo><mi>x</mi><mo stretchy="false" form="postfix">)</mo><mo stretchy="false" form="postfix">)</mo><mo>≈</mo><mn>0.4427</mn></mrow><annotation encoding="application/x-tex">
\frac{1}{\ln 2}-1 = \max_{x \in [0,1)} (x-\log_2(1+x)) \approx 0.4427 
</annotation></semantics></math></p>
<p>This means the maximum gap between <math display="inline" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>x</mi><mo>→</mo><mi>x</mi></mrow><annotation encoding="application/x-tex">x\to x</annotation></semantics></math> and <math display="inline" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>x</mi><mo>→</mo><msub><mrow><mi mathvariant="normal">log</mi><mo>⁡</mo></mrow><mn>2</mn></msub><mo stretchy="false" form="prefix">(</mo><mn>1</mn><mo>+</mo><mi>x</mi><mo stretchy="false" form="postfix">)</mo></mrow><annotation encoding="application/x-tex">x \to \log_2(1+x)</annotation></semantics></math> is <math display="inline" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mfrac><mn>1</mn><mrow><mrow><mi mathvariant="normal">ln</mi><mo>⁡</mo></mrow><mn>2</mn></mrow></mfrac><mo>−</mo><mn>1</mn></mrow><annotation encoding="application/x-tex">\frac{1}{\ln 2}-1</annotation></semantics></math> on the interval <math display="inline" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false" form="prefix">[</mo><mn>0</mn><mo>,</mo><mn>1</mn><mo stretchy="false" form="postfix">)</mo></mrow><annotation encoding="application/x-tex">[0,1)</annotation></semantics></math> Test</p>
</section>
<section id="relation-to-inverse-square-root" class="level1">
<h1>Relation to inverse square root</h1>
<p>We first examined the IEEE-754 floating-point standard, then showed that a floating-point bit pattern encodes one exact representable floating-point value and can also provide a rough approximation of the <math display="inline" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><msub><mrow><mi mathvariant="normal">log</mi><mo>⁡</mo></mrow><mn>2</mn></msub><annotation encoding="application/x-tex">\log_2</annotation></semantics></math> of that same value through direct manipulation of its bit representation.</p>
<p>Our main objective is to efficiently estimate:</p>
<p><math display="block" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>q</mi><mo>=</mo><mfrac><mn>1</mn><msqrt><mi>x</mi></msqrt></mfrac><mo>=</mo><msup><mi>x</mi><mrow><mi>−</mi><mn>1</mn><mi>/</mi><mn>2</mn></mrow></msup></mrow><annotation encoding="application/x-tex">
q = \frac{1}{\sqrt{x}} = x^{-1/2}
</annotation></semantics></math></p>
<p>where <math display="inline" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>x</mi><mo>&gt;</mo><mn>0</mn></mrow><annotation encoding="application/x-tex">x &gt; 0</annotation></semantics></math>.</p>
<p>This problem can be reformulated as finding the root of the equation:</p>
<p><math display="block" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>q</mi><mo>=</mo><mfrac><mn>1</mn><msqrt><mi>x</mi></msqrt></mfrac><mo>⇔</mo><mfrac><mn>1</mn><msup><mi>q</mi><mn>2</mn></msup></mfrac><mo>−</mo><mi>x</mi><mo>=</mo><mn>0</mn></mrow><annotation encoding="application/x-tex">
q = \frac{1}{\sqrt{x}}
\iff
\frac{1}{q^2} - x = 0
</annotation></semantics></math></p>
<p>Defining:</p>
<p><math display="block" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>f</mi><mo stretchy="false" form="prefix">(</mo><mi>q</mi><mo stretchy="false" form="postfix">)</mo><mo>=</mo><mfrac><mn>1</mn><msup><mi>q</mi><mn>2</mn></msup></mfrac><mo>−</mo><mi>x</mi></mrow><annotation encoding="application/x-tex">
f(q)=\frac{1}{q^2}-x
</annotation></semantics></math></p>
<p>the inverse square root problem becomes a root-finding problem:</p>
<p><math display="block" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>f</mi><mo stretchy="false" form="prefix">(</mo><mi>q</mi><mo stretchy="false" form="postfix">)</mo><mo>=</mo><mn>0</mn></mrow><annotation encoding="application/x-tex">
f(q)=0
</annotation></semantics></math></p>
<p>This equation can be solved using the Newton-Raphson method.</p>
<p>The derivative of <math display="inline" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>f</mi><mo stretchy="false" form="prefix">(</mo><mi>q</mi><mo stretchy="false" form="postfix">)</mo></mrow><annotation encoding="application/x-tex">f(q)</annotation></semantics></math> is:</p>
<p><math display="block" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msup><mi>f</mi><mo>′</mo></msup><mo stretchy="false" form="prefix">(</mo><mi>q</mi><mo stretchy="false" form="postfix">)</mo><mo>=</mo><mi>−</mi><mfrac><mn>2</mn><msup><mi>q</mi><mn>3</mn></msup></mfrac></mrow><annotation encoding="application/x-tex">
f'(q)
=
-\frac{2}{q^3}
</annotation></semantics></math></p>
<p>Newton’s method iteratively refines an estimate <math display="inline" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><msub><mi>q</mi><mi>n</mi></msub><annotation encoding="application/x-tex">q_n</annotation></semantics></math> using:</p>
<p><math display="block" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>q</mi><mrow><mi>n</mi><mo>+</mo><mn>1</mn></mrow></msub><mo>=</mo><msub><mi>q</mi><mi>n</mi></msub><mo>−</mo><mfrac><mrow><mi>f</mi><mo stretchy="false" form="prefix">(</mo><msub><mi>q</mi><mi>n</mi></msub><mo stretchy="false" form="postfix">)</mo></mrow><mrow><msup><mi>f</mi><mo>′</mo></msup><mo stretchy="false" form="prefix">(</mo><msub><mi>q</mi><mi>n</mi></msub><mo stretchy="false" form="postfix">)</mo></mrow></mfrac></mrow><annotation encoding="application/x-tex">
q_{n+1}
=
q_n
-
\frac{f(q_n)}{f'(q_n)}
</annotation></semantics></math></p>
<p>Substituting <math display="inline" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>f</mi><mo stretchy="false" form="prefix">(</mo><mi>q</mi><mo stretchy="false" form="postfix">)</mo></mrow><annotation encoding="application/x-tex">f(q)</annotation></semantics></math> and <math display="inline" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msup><mi>f</mi><mo>′</mo></msup><mo stretchy="false" form="prefix">(</mo><mi>q</mi><mo stretchy="false" form="postfix">)</mo></mrow><annotation encoding="application/x-tex">f'(q)</annotation></semantics></math> gives:</p>
<p><math display="block" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>q</mi><mrow><mi>n</mi><mo>+</mo><mn>1</mn></mrow></msub><mo>=</mo><msub><mi>q</mi><mi>n</mi></msub><mo>−</mo><mfrac><mrow><mfrac><mn>1</mn><msubsup><mi>q</mi><mi>n</mi><mn>2</mn></msubsup></mfrac><mo>−</mo><mi>x</mi></mrow><mrow><mi>−</mi><mfrac><mn>2</mn><msubsup><mi>q</mi><mi>n</mi><mn>3</mn></msubsup></mfrac></mrow></mfrac></mrow><annotation encoding="application/x-tex">
q_{n+1}
=
q_n
-
\frac{\frac{1}{q_n^2}-x}{-\frac{2}{q_n^3}}
</annotation></semantics></math></p>
<p>which simplifies to:</p>
<p><math display="block" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>q</mi><mrow><mi>n</mi><mo>+</mo><mn>1</mn></mrow></msub><mo>=</mo><msub><mi>q</mi><mi>n</mi></msub><mo>+</mo><mfrac><msub><mi>q</mi><mi>n</mi></msub><mn>2</mn></mfrac><mrow><mo stretchy="true" form="prefix">(</mo><mn>1</mn><mo>−</mo><mi>x</mi><msubsup><mi>q</mi><mi>n</mi><mn>2</mn></msubsup><mo stretchy="true" form="postfix">)</mo></mrow></mrow><annotation encoding="application/x-tex">
q_{n+1}
=
q_n
+
\frac{q_n}{2}
\left(
1-xq_n^2
\right)
</annotation></semantics></math></p>
<p>and finally:</p>
<p><math display="block" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>q</mi><mrow><mi>n</mi><mo>+</mo><mn>1</mn></mrow></msub><mo>=</mo><msub><mi>q</mi><mi>n</mi></msub><mrow><mo stretchy="true" form="prefix">(</mo><mfrac><mn>3</mn><mn>2</mn></mfrac><mo>−</mo><mfrac><mrow><mi>x</mi><msubsup><mi>q</mi><mi>n</mi><mn>2</mn></msubsup></mrow><mn>2</mn></mfrac><mo stretchy="true" form="postfix">)</mo></mrow></mrow><annotation encoding="application/x-tex">
q_{n+1}
=
q_n
\left(
\frac{3}{2}
-
\frac{xq_n^2}{2}
\right)
</annotation></semantics></math></p>
<p>This is exactly the famous Newton refinement step used in the Quake 3 implementation <a href="https://github.com/id-Software/Quake-III-Arena/blob/dbe4ddb10315479fc00086f08e25d968b4b43c49/code/game/q_math.c#L563" target="_blank" rel="noopener noreferrer">q_math.c#L563</a></p>
<div class="code-copy-outer-scaffold"><div class="sourceCode" id="cb2"><pre><code class="sourceCode c"><span id="cb2-1"><a href="#cb2-1" aria-hidden="true" tabindex="-1"></a>y <span class="op">=</span> y <span class="op">*</span> <span class="op">(</span><span class="fl">1.5</span><span class="bu">F</span> <span class="op">-</span> <span class="op">(</span>x2 <span class="op">*</span> y <span class="op">*</span> y<span class="op">))</span></span></code></pre></div></div>
<p>In practice, the Newton refinement step can be iterated multiple times depending on the desired numerical precision of the estimation.</p>
<p>Such iterative methods require an initial estimate from which the successive refinements are computed in order to converge toward the solution of the Newton formulation.</p>
<p>The real ingenuity of the Quake 3 trick lies in the initialization of the Newton–Raphson iteration. A sufficiently accurate starting point drastically reduces the number of refinement steps required to approximate the inverse square root.</p>
<p>Starting from the refined affine approximation of the IEEE-754 bit representation,</p>
<p><math display="block" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>x</mi><mi>i</mi></msub><mo>≈</mo><msup><mn>2</mn><mn>23</mn></msup><mrow><mo stretchy="true" form="prefix">(</mo><msub><mrow><mi mathvariant="normal">log</mi><mo>⁡</mo></mrow><mn>2</mn></msub><mo stretchy="false" form="prefix">(</mo><msub><mi>x</mi><mi>f</mi></msub><mo stretchy="false" form="postfix">)</mo><mo>+</mo><mn>127</mn><mo>−</mo><mi>α</mi><msub><mi>m</mi><mi>x</mi></msub><mo stretchy="true" form="postfix">)</mo></mrow><mo>,</mo><mspace width="2.0em"></mspace><mi>α</mi><mo>=</mo><mfrac><mn>1</mn><mrow><mrow><mi mathvariant="normal">ln</mi><mo>⁡</mo></mrow><mn>2</mn></mrow></mfrac><mo>−</mo><mn>1</mn><mo>,</mo></mrow><annotation encoding="application/x-tex">
x_i
\approx
2^{23}
\left(
\log_2(x_f)+127-\alpha m_x
\right),
\qquad
\alpha=\frac{1}{\ln 2}-1,
</annotation></semantics></math></p>
<p>where <math display="inline" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><msub><mi>m</mi><mi>x</mi></msub><annotation encoding="application/x-tex">m_x</annotation></semantics></math> is the mantissa fraction of <math display="inline" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><msub><mi>x</mi><mi>f</mi></msub><annotation encoding="application/x-tex">x_f</annotation></semantics></math>, we seek an approximation of</p>
<p><math display="block" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>q</mi><mi>f</mi></msub><mo>=</mo><msubsup><mi>x</mi><mi>f</mi><mrow><mi>−</mi><mn>1</mn><mi>/</mi><mn>2</mn></mrow></msubsup><mi>.</mi></mrow><annotation encoding="application/x-tex">
q_f=x_f^{-1/2}.
</annotation></semantics></math></p>
<p>Using logarithmic identities,</p>
<p><math display="block" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mrow><mi mathvariant="normal">log</mi><mo>⁡</mo></mrow><mn>2</mn></msub><mo stretchy="false" form="prefix">(</mo><msub><mi>q</mi><mi>f</mi></msub><mo stretchy="false" form="postfix">)</mo><mo>=</mo><mi>−</mi><mfrac><mn>1</mn><mn>2</mn></mfrac><msub><mrow><mi mathvariant="normal">log</mi><mo>⁡</mo></mrow><mn>2</mn></msub><mo stretchy="false" form="prefix">(</mo><msub><mi>x</mi><mi>f</mi></msub><mo stretchy="false" form="postfix">)</mo><mi>.</mi></mrow><annotation encoding="application/x-tex">
\log_2(q_f)
=
-\frac12\log_2(x_f).
</annotation></semantics></math></p>
<p>Applying the same affine approximation to <math display="inline" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><msub><mi>q</mi><mi>f</mi></msub><annotation encoding="application/x-tex">q_f</annotation></semantics></math> gives</p>
<p><math display="block" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>q</mi><mi>i</mi></msub><mo>≈</mo><msup><mn>2</mn><mn>23</mn></msup><mrow><mo stretchy="true" form="prefix">(</mo><mi>−</mi><mfrac><mn>1</mn><mn>2</mn></mfrac><msub><mrow><mi mathvariant="normal">log</mi><mo>⁡</mo></mrow><mn>2</mn></msub><mo stretchy="false" form="prefix">(</mo><msub><mi>x</mi><mi>f</mi></msub><mo stretchy="false" form="postfix">)</mo><mo>+</mo><mn>127</mn><mo>−</mo><mi>α</mi><msub><mi>m</mi><mi>q</mi></msub><mo stretchy="true" form="postfix">)</mo></mrow><mo>,</mo></mrow><annotation encoding="application/x-tex">
q_i
\approx
2^{23}
\left(
-\frac12\log_2(x_f)
+
127
-
\alpha m_q
\right),
</annotation></semantics></math></p>
<p>with <math display="inline" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><msub><mi>m</mi><mi>q</mi></msub><annotation encoding="application/x-tex">m_q</annotation></semantics></math> the mantissa fraction of <math display="inline" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><msub><mi>q</mi><mi>f</mi></msub><annotation encoding="application/x-tex">q_f</annotation></semantics></math>.</p>
<p>Replacing <math display="inline" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mrow><mi mathvariant="normal">log</mi><mo>⁡</mo></mrow><mn>2</mn></msub><mo stretchy="false" form="prefix">(</mo><msub><mi>x</mi><mi>f</mi></msub><mo stretchy="false" form="postfix">)</mo></mrow><annotation encoding="application/x-tex">\log_2(x_f)</annotation></semantics></math> using the approximation of <math display="inline" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><msub><mi>x</mi><mi>i</mi></msub><annotation encoding="application/x-tex">x_i</annotation></semantics></math> yields</p>
<p><math display="block" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>q</mi><mi>i</mi></msub><mo>≈</mo><mi>−</mi><mfrac><mn>1</mn><mn>2</mn></mfrac><msub><mi>x</mi><mi>i</mi></msub><mo>+</mo><mn>3</mn><mo>×</mo><mn>127</mn><mo>×</mo><msup><mn>2</mn><mn>22</mn></msup><mo>−</mo><msup><mn>2</mn><mn>23</mn></msup><mi>α</mi><mrow><mo stretchy="true" form="prefix">(</mo><mfrac><msub><mi>m</mi><mi>x</mi></msub><mn>2</mn></mfrac><mo>+</mo><msub><mi>m</mi><mi>q</mi></msub><mo stretchy="true" form="postfix">)</mo></mrow><mi>.</mi></mrow><annotation encoding="application/x-tex">
q_i
\approx
-\frac12 x_i
+
3\times127\times2^{22}
-
2^{23}\alpha
\left(
\frac{m_x}{2}+m_q
\right).
</annotation></semantics></math></p>
<p>Hence the inverse square root initialization can be written as</p>
<p><math display="block" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>q</mi><mi>i</mi></msub><mo>≈</mo><mi>C</mi><mo stretchy="false" form="prefix">(</mo><msub><mi>m</mi><mi>x</mi></msub><mo>,</mo><msub><mi>m</mi><mi>q</mi></msub><mo stretchy="false" form="postfix">)</mo><mo>−</mo><mfrac><msub><mi>x</mi><mi>i</mi></msub><mn>2</mn></mfrac><mo>,</mo></mrow><annotation encoding="application/x-tex">
q_i
\approx
C(m_x,m_q)-\frac{x_i}{2},
</annotation></semantics></math></p>
<p>where</p>
<p><math display="block" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>C</mi><mo stretchy="false" form="prefix">(</mo><msub><mi>m</mi><mi>x</mi></msub><mo>,</mo><msub><mi>m</mi><mi>q</mi></msub><mo stretchy="false" form="postfix">)</mo><mo>=</mo><mn>3</mn><mo>×</mo><mn>127</mn><mo>×</mo><msup><mn>2</mn><mn>22</mn></msup><mo>−</mo><msup><mn>2</mn><mn>23</mn></msup><mi>α</mi><mrow><mo stretchy="true" form="prefix">(</mo><mfrac><msub><mi>m</mi><mi>x</mi></msub><mn>2</mn></mfrac><mo>+</mo><msub><mi>m</mi><mi>q</mi></msub><mo stretchy="true" form="postfix">)</mo></mrow><mi>.</mi></mrow><annotation encoding="application/x-tex">
C(m_x,m_q)
=
3\times127\times2^{22}
-
2^{23}\alpha
\left(
\frac{m_x}{2}+m_q
\right).
</annotation></semantics></math></p>
<p>Ignoring the mantissa correction gives the crude theoretical constant</p>
<p><math display="block" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>C</mi><mn>0</mn></msub><mo>=</mo><mn>3</mn><mo>×</mo><mn>127</mn><mo>×</mo><msup><mn>2</mn><mn>22</mn></msup><mo>=</mo><mn>1598029824</mn><mo>=</mo><mtext mathvariant="monospace">𝟶𝚡𝟻𝚏𝟺𝟶𝟶𝟶𝟶𝟶</mtext><mi>.</mi></mrow><annotation encoding="application/x-tex">
C_0
=
3\times127\times2^{22}
=
1598029824
=
\texttt{0x5f400000}.
</annotation></semantics></math></p>
<p>The actual Quake 3 implementation instead uses</p>
<p><math display="block" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>C</mi><mtext mathvariant="normal">quake</mtext></msub><mo>=</mo><mtext mathvariant="monospace">𝟶𝚡𝟻𝚏𝟹𝟽𝟻𝟿𝚍𝚏</mtext><mo>=</mo><mn>1597463007</mn><mi>.</mi></mrow><annotation encoding="application/x-tex">
C_{\text{quake}}
=
\texttt{0x5f3759df}
=
1597463007.
</annotation></semantics></math></p>
<p>Thus,</p>
<p><math display="block" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>C</mi><mtext mathvariant="normal">quake</mtext></msub><mo>=</mo><msub><mi>C</mi><mn>0</mn></msub><mo>−</mo><mn>566817</mn><mi>.</mi></mrow><annotation encoding="application/x-tex">
C_{\text{quake}}
=
C_0-566817.
</annotation></semantics></math></p>
<p>This offset compensates for the mantissa-dependent term neglected in the simplified affine-logarithmic approximation. Since <math display="inline" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><msub><mi>m</mi><mi>x</mi></msub><annotation encoding="application/x-tex">m_x</annotation></semantics></math> and <math display="inline" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><msub><mi>m</mi><mi>q</mi></msub><annotation encoding="application/x-tex">m_q</annotation></semantics></math> vary with the input value, no single constant can exactly match every floating-point number. One possible approach is therefore to approximate the term <math display="inline" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>C</mi><mo stretchy="false" form="prefix">(</mo><msub><mi>m</mi><mi>x</mi></msub><mo>,</mo><msub><mi>m</mi><mi>q</mi></msub><mo stretchy="false" form="postfix">)</mo></mrow><annotation encoding="application/x-tex">C(m_x,m_q)</annotation></semantics></math> with a fixed constant that minimizes the average error between the true correction and the quantity <math display="inline" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mfrac><msub><mi>m</mi><mi>x</mi></msub><mn>2</mn></mfrac><mo>+</mo><msub><mi>m</mi><mi>q</mi></msub></mrow><annotation encoding="application/x-tex">\frac{m_x}{2}+m_q</annotation></semantics></math>.</p>
<p>However, this is not the true objective of the Quake 3 method. In practice, the obtained approximation is only used as the initialization of a Newton–Raphson iteration, followed by a single refinement step. Consequently, the optimal constant is not the one minimizing the initial approximation error itself, but rather the one minimizing the final error after one Newton–Raphson iteration. This directly optimizes the actual target quantity: the inverse square root approximation.</p>
</section>
<section id="the-origin-of-the-magic-constant" class="level1">
<h1>The origin of the magic constant</h1>
<p>To find the magical value, we will minimize the error using this Python code. The goal is to do an exhaustive search around the Quake magic value to evaluate the approximation error after one Newton iteration.</p>
<div id="9d4573b9" class="cell" data-execution_count="29">
<div class="code-copy-outer-scaffold"><div class="sourceCode cell-code" id="cb3"><pre><code class="sourceCode python"><span id="cb3-1"><a href="#cb3-1" aria-hidden="true" tabindex="-1"></a><span class="im">import</span> numpy <span class="im">as</span> np</span>
<span id="cb3-2"><a href="#cb3-2" aria-hidden="true" tabindex="-1"></a><span class="im">import</span> matplotlib.pyplot <span class="im">as</span> plt</span>
<span id="cb3-3"><a href="#cb3-3" aria-hidden="true" tabindex="-1"></a></span>
<span id="cb3-4"><a href="#cb3-4" aria-hidden="true" tabindex="-1"></a></span>
<span id="cb3-5"><a href="#cb3-5" aria-hidden="true" tabindex="-1"></a><span class="kw">def</span> qrsqrt(x, C):</span>
<span id="cb3-6"><a href="#cb3-6" aria-hidden="true" tabindex="-1"></a>    x <span class="op">=</span> x.astype(np.float32, copy<span class="op">=</span><span class="va">False</span>)</span>
<span id="cb3-7"><a href="#cb3-7" aria-hidden="true" tabindex="-1"></a>    y <span class="op">=</span> (np.uint32(C) <span class="op">-</span> (x.view(np.uint32) <span class="op">&gt;&gt;</span> np.uint32(<span class="dv">1</span>))).view(np.float32)</span>
<span id="cb3-8"><a href="#cb3-8" aria-hidden="true" tabindex="-1"></a>    <span class="cf">return</span> np.float32(y <span class="op">*</span> (np.float32(<span class="fl">1.5</span>) <span class="op">-</span> np.float32(<span class="fl">0.5</span>) <span class="op">*</span> x <span class="op">*</span> y <span class="op">*</span> y))</span>
<span id="cb3-9"><a href="#cb3-9" aria-hidden="true" tabindex="-1"></a></span>
<span id="cb3-10"><a href="#cb3-10" aria-hidden="true" tabindex="-1"></a></span>
<span id="cb3-11"><a href="#cb3-11" aria-hidden="true" tabindex="-1"></a><span class="kw">def</span> maxerr_lomont(C, a, b, bit_step<span class="op">=</span><span class="dv">1</span>, chunk<span class="op">=</span><span class="dv">1_000_000</span>):</span>
<span id="cb3-12"><a href="#cb3-12" aria-hidden="true" tabindex="-1"></a>    max_err <span class="op">=</span> <span class="fl">0.0</span></span>
<span id="cb3-13"><a href="#cb3-13" aria-hidden="true" tabindex="-1"></a>    <span class="cf">for</span> s <span class="kw">in</span> <span class="bu">range</span>(a, b, chunk <span class="op">*</span> bit_step):</span>
<span id="cb3-14"><a href="#cb3-14" aria-hidden="true" tabindex="-1"></a>        bits <span class="op">=</span> np.arange(s, <span class="bu">min</span>(s <span class="op">+</span> chunk <span class="op">*</span> bit_step, b), bit_step, dtype<span class="op">=</span>np.uint32)</span>
<span id="cb3-15"><a href="#cb3-15" aria-hidden="true" tabindex="-1"></a>        x <span class="op">=</span> bits.view(np.float32)</span>
<span id="cb3-16"><a href="#cb3-16" aria-hidden="true" tabindex="-1"></a>        err <span class="op">=</span> np.<span class="bu">abs</span>(np.float32(<span class="fl">1.0</span>) <span class="op">-</span> qrsqrt(x, C) <span class="op">*</span> np.sqrt(x, dtype<span class="op">=</span>np.float32))</span>
<span id="cb3-17"><a href="#cb3-17" aria-hidden="true" tabindex="-1"></a>        max_err <span class="op">=</span> <span class="bu">max</span>(max_err, <span class="bu">float</span>(err.<span class="bu">max</span>()))</span>
<span id="cb3-18"><a href="#cb3-18" aria-hidden="true" tabindex="-1"></a>    <span class="cf">return</span> max_err</span>
<span id="cb3-19"><a href="#cb3-19" aria-hidden="true" tabindex="-1"></a></span>
<span id="cb3-20"><a href="#cb3-20" aria-hidden="true" tabindex="-1"></a></span>
<span id="cb3-21"><a href="#cb3-21" aria-hidden="true" tabindex="-1"></a><span class="kw">def</span> ternary_int(lo, hi, f):</span>
<span id="cb3-22"><a href="#cb3-22" aria-hidden="true" tabindex="-1"></a>    cache <span class="op">=</span> {}</span>
<span id="cb3-23"><a href="#cb3-23" aria-hidden="true" tabindex="-1"></a></span>
<span id="cb3-24"><a href="#cb3-24" aria-hidden="true" tabindex="-1"></a>    <span class="kw">def</span> F(c):</span>
<span id="cb3-25"><a href="#cb3-25" aria-hidden="true" tabindex="-1"></a>        cache.setdefault(c, f(c))</span>
<span id="cb3-26"><a href="#cb3-26" aria-hidden="true" tabindex="-1"></a>        <span class="cf">return</span> cache[c]</span>
<span id="cb3-27"><a href="#cb3-27" aria-hidden="true" tabindex="-1"></a></span>
<span id="cb3-28"><a href="#cb3-28" aria-hidden="true" tabindex="-1"></a>    <span class="cf">while</span> hi <span class="op">-</span> lo <span class="op">&gt;</span> <span class="dv">16</span>:</span>
<span id="cb3-29"><a href="#cb3-29" aria-hidden="true" tabindex="-1"></a>        m1, m2 <span class="op">=</span> lo <span class="op">+</span> (hi <span class="op">-</span> lo) <span class="op">//</span> <span class="dv">3</span>, hi <span class="op">-</span> (hi <span class="op">-</span> lo) <span class="op">//</span> <span class="dv">3</span></span>
<span id="cb3-30"><a href="#cb3-30" aria-hidden="true" tabindex="-1"></a>        lo, hi <span class="op">=</span> (lo, m2 <span class="op">-</span> <span class="dv">1</span>) <span class="cf">if</span> F(m1) <span class="op">&lt;</span> F(m2) <span class="cf">else</span> (m1 <span class="op">+</span> <span class="dv">1</span>, hi)</span>
<span id="cb3-31"><a href="#cb3-31" aria-hidden="true" tabindex="-1"></a></span>
<span id="cb3-32"><a href="#cb3-32" aria-hidden="true" tabindex="-1"></a>    <span class="cf">return</span> <span class="bu">min</span>(((c, F(c)) <span class="cf">for</span> c <span class="kw">in</span> <span class="bu">range</span>(lo, hi <span class="op">+</span> <span class="dv">1</span>)), key<span class="op">=</span><span class="kw">lambda</span> t: t[<span class="dv">1</span>])</span>
<span id="cb3-33"><a href="#cb3-33" aria-hidden="true" tabindex="-1"></a></span>
<span id="cb3-34"><a href="#cb3-34" aria-hidden="true" tabindex="-1"></a></span>
<span id="cb3-35"><a href="#cb3-35" aria-hidden="true" tabindex="-1"></a><span class="kw">def</span> group_by_error(constants, errors, decimals<span class="op">=</span><span class="dv">18</span>):</span>
<span id="cb3-36"><a href="#cb3-36" aria-hidden="true" tabindex="-1"></a>    groups <span class="op">=</span> {}</span>
<span id="cb3-37"><a href="#cb3-37" aria-hidden="true" tabindex="-1"></a>    <span class="cf">for</span> C, E <span class="kw">in</span> <span class="bu">zip</span>(constants.astype(np.uint32), errors.astype(np.float64)):</span>
<span id="cb3-38"><a href="#cb3-38" aria-hidden="true" tabindex="-1"></a>        groups.setdefault(<span class="bu">round</span>(<span class="bu">float</span>(E), decimals), []).append(<span class="bu">int</span>(C))</span>
<span id="cb3-39"><a href="#cb3-39" aria-hidden="true" tabindex="-1"></a>    <span class="cf">return</span> groups</span>
<span id="cb3-40"><a href="#cb3-40" aria-hidden="true" tabindex="-1"></a></span>
<span id="cb3-41"><a href="#cb3-41" aria-hidden="true" tabindex="-1"></a></span>
<span id="cb3-42"><a href="#cb3-42" aria-hidden="true" tabindex="-1"></a><span class="kw">def</span> hex_ticks(axis, values, n<span class="op">=</span><span class="dv">8</span>, rot<span class="op">=</span><span class="dv">35</span>):</span>
<span id="cb3-43"><a href="#cb3-43" aria-hidden="true" tabindex="-1"></a>    ticks <span class="op">=</span> np.linspace(values[<span class="dv">0</span>], values[<span class="op">-</span><span class="dv">1</span>], n, dtype<span class="op">=</span>np.uint32)</span>
<span id="cb3-44"><a href="#cb3-44" aria-hidden="true" tabindex="-1"></a>    axis.set_xticks(ticks.astype(np.int64))</span>
<span id="cb3-45"><a href="#cb3-45" aria-hidden="true" tabindex="-1"></a>    axis.set_xticklabels([<span class="bu">hex</span>(<span class="bu">int</span>(t)) <span class="cf">for</span> t <span class="kw">in</span> ticks], rotation<span class="op">=</span>rot, ha<span class="op">=</span><span class="st">"right"</span>)</span>
<span id="cb3-46"><a href="#cb3-46" aria-hidden="true" tabindex="-1"></a></span>
<span id="cb3-47"><a href="#cb3-47" aria-hidden="true" tabindex="-1"></a></span>
<span id="cb3-48"><a href="#cb3-48" aria-hidden="true" tabindex="-1"></a>quake, lomont <span class="op">=</span> <span class="bn">0x5F3759DF</span>, <span class="bn">0x5F375A86</span></span>
<span id="cb3-49"><a href="#cb3-49" aria-hidden="true" tabindex="-1"></a>bit_start, bit_stop <span class="op">=</span> <span class="bn">0x3F800000</span>, <span class="bn">0x40800000</span></span>
<span id="cb3-50"><a href="#cb3-50" aria-hidden="true" tabindex="-1"></a></span>
<span id="cb3-51"><a href="#cb3-51" aria-hidden="true" tabindex="-1"></a>fast_C, fast_E <span class="op">=</span> ternary_int(</span>
<span id="cb3-52"><a href="#cb3-52" aria-hidden="true" tabindex="-1"></a>    quake <span class="op">-</span> <span class="dv">50_000</span>,</span>
<span id="cb3-53"><a href="#cb3-53" aria-hidden="true" tabindex="-1"></a>    quake <span class="op">+</span> <span class="dv">50_000</span>,</span>
<span id="cb3-54"><a href="#cb3-54" aria-hidden="true" tabindex="-1"></a>    <span class="kw">lambda</span> C: maxerr_lomont(C, bit_start, bit_stop, bit_step<span class="op">=</span><span class="dv">4096</span>),</span>
<span id="cb3-55"><a href="#cb3-55" aria-hidden="true" tabindex="-1"></a>)</span>
<span id="cb3-56"><a href="#cb3-56" aria-hidden="true" tabindex="-1"></a><span class="bu">print</span>(<span class="st">"fast:"</span>, <span class="bu">hex</span>(fast_C), fast_C, <span class="ss">f"</span><span class="sc">{</span>fast_E<span class="sc">:.18e}</span><span class="ss">"</span>)</span>
<span id="cb3-57"><a href="#cb3-57" aria-hidden="true" tabindex="-1"></a></span>
<span id="cb3-58"><a href="#cb3-58" aria-hidden="true" tabindex="-1"></a>span <span class="op">=</span> <span class="dv">256</span></span>
<span id="cb3-59"><a href="#cb3-59" aria-hidden="true" tabindex="-1"></a>Cs <span class="op">=</span> np.arange(fast_C <span class="op">-</span> span, fast_C <span class="op">+</span> span <span class="op">+</span> <span class="dv">1</span>, dtype<span class="op">=</span>np.uint32)</span>
<span id="cb3-60"><a href="#cb3-60" aria-hidden="true" tabindex="-1"></a>Es <span class="op">=</span> np.array([maxerr_lomont(<span class="bu">int</span>(C), bit_start, bit_stop) <span class="cf">for</span> C <span class="kw">in</span> Cs])</span>
<span id="cb3-61"><a href="#cb3-61" aria-hidden="true" tabindex="-1"></a></span>
<span id="cb3-62"><a href="#cb3-62" aria-hidden="true" tabindex="-1"></a>best_i <span class="op">=</span> <span class="bu">int</span>(np.argmin(Es))</span>
<span id="cb3-63"><a href="#cb3-63" aria-hidden="true" tabindex="-1"></a>best_C, best_E <span class="op">=</span> <span class="bu">int</span>(Cs[best_i]), <span class="bu">float</span>(Es[best_i])</span>
<span id="cb3-64"><a href="#cb3-64" aria-hidden="true" tabindex="-1"></a>quake_E <span class="op">=</span> maxerr_lomont(quake, bit_start, bit_stop)</span>
<span id="cb3-65"><a href="#cb3-65" aria-hidden="true" tabindex="-1"></a>lomont_E <span class="op">=</span> maxerr_lomont(lomont, bit_start, bit_stop)</span>
<span id="cb3-66"><a href="#cb3-66" aria-hidden="true" tabindex="-1"></a></span>
<span id="cb3-67"><a href="#cb3-67" aria-hidden="true" tabindex="-1"></a>groups <span class="op">=</span> group_by_error(Cs, Es)</span>
<span id="cb3-68"><a href="#cb3-68" aria-hidden="true" tabindex="-1"></a></span>
<span id="cb3-69"><a href="#cb3-69" aria-hidden="true" tabindex="-1"></a><span class="bu">print</span>(<span class="st">"</span><span class="ch">\n</span><span class="st">Groups by error score, first 12 sorted:"</span>)</span>
<span id="cb3-70"><a href="#cb3-70" aria-hidden="true" tabindex="-1"></a><span class="cf">for</span> E <span class="kw">in</span> <span class="bu">sorted</span>(groups)[:<span class="dv">12</span>]:</span>
<span id="cb3-71"><a href="#cb3-71" aria-hidden="true" tabindex="-1"></a>    g <span class="op">=</span> groups[E]</span>
<span id="cb3-72"><a href="#cb3-72" aria-hidden="true" tabindex="-1"></a>    <span class="bu">print</span>(<span class="ss">f"E=</span><span class="sc">{</span>E<span class="sc">:.18e}</span><span class="ss"> | n=</span><span class="sc">{</span><span class="bu">len</span>(g)<span class="sc">:3d}</span><span class="ss"> | from=</span><span class="sc">{</span><span class="bu">hex</span>(g[<span class="dv">0</span>])<span class="sc">}</span><span class="ss"> to=</span><span class="sc">{</span><span class="bu">hex</span>(g[<span class="op">-</span><span class="dv">1</span>])<span class="sc">}</span><span class="ss">"</span>)</span>
<span id="cb3-73"><a href="#cb3-73" aria-hidden="true" tabindex="-1"></a></span>
<span id="cb3-74"><a href="#cb3-74" aria-hidden="true" tabindex="-1"></a>min_constants_exact <span class="op">=</span> Cs[Es <span class="op">==</span> best_E].astype(np.uint32)</span>
<span id="cb3-75"><a href="#cb3-75" aria-hidden="true" tabindex="-1"></a>tol <span class="op">=</span> <span class="fl">1e-8</span></span>
<span id="cb3-76"><a href="#cb3-76" aria-hidden="true" tabindex="-1"></a>near_min <span class="op">=</span> Cs[Es <span class="op">&lt;=</span> best_E <span class="op">+</span> tol].astype(np.uint32)</span>
<span id="cb3-77"><a href="#cb3-77" aria-hidden="true" tabindex="-1"></a></span>
<span id="cb3-78"><a href="#cb3-78" aria-hidden="true" tabindex="-1"></a><span class="bu">print</span>(<span class="st">"</span><span class="ch">\n</span><span class="st">Minimum error:"</span>)</span>
<span id="cb3-79"><a href="#cb3-79" aria-hidden="true" tabindex="-1"></a><span class="bu">print</span>(<span class="ss">f"E_min = </span><span class="sc">{</span>best_E<span class="sc">:.18e}</span><span class="ss">"</span>)</span>
<span id="cb3-80"><a href="#cb3-80" aria-hidden="true" tabindex="-1"></a></span>
<span id="cb3-81"><a href="#cb3-81" aria-hidden="true" tabindex="-1"></a><span class="bu">print</span>(<span class="st">"</span><span class="ch">\n</span><span class="st">Constants reaching exact minimum:"</span>)</span>
<span id="cb3-82"><a href="#cb3-82" aria-hidden="true" tabindex="-1"></a><span class="cf">for</span> C <span class="kw">in</span> min_constants_exact:</span>
<span id="cb3-83"><a href="#cb3-83" aria-hidden="true" tabindex="-1"></a>    <span class="bu">print</span>(<span class="bu">hex</span>(<span class="bu">int</span>(C)), <span class="bu">int</span>(C))</span>
<span id="cb3-84"><a href="#cb3-84" aria-hidden="true" tabindex="-1"></a></span>
<span id="cb3-85"><a href="#cb3-85" aria-hidden="true" tabindex="-1"></a><span class="bu">print</span>(<span class="ss">f"</span><span class="ch">\n</span><span class="ss">Constants within </span><span class="sc">{</span>tol<span class="sc">:.1e}</span><span class="ss"> of the minimum:"</span>)</span>
<span id="cb3-86"><a href="#cb3-86" aria-hidden="true" tabindex="-1"></a><span class="bu">print</span>(<span class="st">"count ="</span>, <span class="bu">len</span>(near_min))</span>
<span id="cb3-87"><a href="#cb3-87" aria-hidden="true" tabindex="-1"></a><span class="bu">print</span>(<span class="st">"from  ="</span>, <span class="bu">hex</span>(<span class="bu">int</span>(near_min[<span class="dv">0</span>])), <span class="bu">int</span>(near_min[<span class="dv">0</span>]))</span>
<span id="cb3-88"><a href="#cb3-88" aria-hidden="true" tabindex="-1"></a><span class="bu">print</span>(<span class="st">"to    ="</span>, <span class="bu">hex</span>(<span class="bu">int</span>(near_min[<span class="op">-</span><span class="dv">1</span>])), <span class="bu">int</span>(near_min[<span class="op">-</span><span class="dv">1</span>]))</span>
<span id="cb3-89"><a href="#cb3-89" aria-hidden="true" tabindex="-1"></a></span>
<span id="cb3-90"><a href="#cb3-90" aria-hidden="true" tabindex="-1"></a><span class="cf">for</span> C <span class="kw">in</span> near_min:</span>
<span id="cb3-91"><a href="#cb3-91" aria-hidden="true" tabindex="-1"></a>    i <span class="op">=</span> <span class="bu">int</span>(np.where(Cs <span class="op">==</span> C)[<span class="dv">0</span>][<span class="dv">0</span>])</span>
<span id="cb3-92"><a href="#cb3-92" aria-hidden="true" tabindex="-1"></a>    <span class="bu">print</span>(<span class="bu">hex</span>(<span class="bu">int</span>(C)), <span class="bu">int</span>(C), <span class="ss">f"</span><span class="sc">{</span>Es[i]<span class="sc">:.18e}</span><span class="ss">"</span>)</span>
<span id="cb3-93"><a href="#cb3-93" aria-hidden="true" tabindex="-1"></a></span>
<span id="cb3-94"><a href="#cb3-94" aria-hidden="true" tabindex="-1"></a><span class="bu">print</span>(<span class="st">"</span><span class="ch">\n</span><span class="st">"</span> <span class="op">+</span> <span class="st">"="</span> <span class="op">*</span> <span class="dv">70</span>)</span>
<span id="cb3-95"><a href="#cb3-95" aria-hidden="true" tabindex="-1"></a><span class="bu">print</span>(<span class="st">"RESULTS"</span>)</span>
<span id="cb3-96"><a href="#cb3-96" aria-hidden="true" tabindex="-1"></a><span class="bu">print</span>(<span class="st">"="</span> <span class="op">*</span> <span class="dv">70</span>)</span>
<span id="cb3-97"><a href="#cb3-97" aria-hidden="true" tabindex="-1"></a></span>
<span id="cb3-98"><a href="#cb3-98" aria-hidden="true" tabindex="-1"></a><span class="cf">for</span> name, C, E <span class="kw">in</span> (</span>
<span id="cb3-99"><a href="#cb3-99" aria-hidden="true" tabindex="-1"></a>    (<span class="st">"Quake"</span>, quake, quake_E),</span>
<span id="cb3-100"><a href="#cb3-100" aria-hidden="true" tabindex="-1"></a>    (<span class="st">"Lomont"</span>, lomont, lomont_E),</span>
<span id="cb3-101"><a href="#cb3-101" aria-hidden="true" tabindex="-1"></a>    (<span class="st">"Best"</span>, best_C, best_E),</span>
<span id="cb3-102"><a href="#cb3-102" aria-hidden="true" tabindex="-1"></a>):</span>
<span id="cb3-103"><a href="#cb3-103" aria-hidden="true" tabindex="-1"></a>    <span class="bu">print</span>(<span class="ss">f"</span><span class="ch">\n</span><span class="sc">{</span>name<span class="sc">}</span><span class="ss">:"</span>)</span>
<span id="cb3-104"><a href="#cb3-104" aria-hidden="true" tabindex="-1"></a>    <span class="bu">print</span>(<span class="bu">hex</span>(C), C, <span class="ss">f"</span><span class="sc">{</span>E<span class="sc">:.18e}</span><span class="ss">"</span>)</span>
<span id="cb3-105"><a href="#cb3-105" aria-hidden="true" tabindex="-1"></a></span>
<span id="cb3-106"><a href="#cb3-106" aria-hidden="true" tabindex="-1"></a><span class="bu">print</span>(<span class="st">"</span><span class="ch">\n</span><span class="st">Differences:"</span>)</span>
<span id="cb3-107"><a href="#cb3-107" aria-hidden="true" tabindex="-1"></a><span class="bu">print</span>(<span class="st">"best_C - quake  ="</span>, best_C <span class="op">-</span> quake)</span>
<span id="cb3-108"><a href="#cb3-108" aria-hidden="true" tabindex="-1"></a><span class="bu">print</span>(<span class="st">"best_C - lomont ="</span>, best_C <span class="op">-</span> lomont)</span>
<span id="cb3-109"><a href="#cb3-109" aria-hidden="true" tabindex="-1"></a></span>
<span id="cb3-110"><a href="#cb3-110" aria-hidden="true" tabindex="-1"></a><span class="bu">print</span>(<span class="st">"</span><span class="ch">\n</span><span class="st">Error improvements:"</span>)</span>
<span id="cb3-111"><a href="#cb3-111" aria-hidden="true" tabindex="-1"></a><span class="bu">print</span>(<span class="st">"quake_E  - best_E ="</span>, quake_E <span class="op">-</span> best_E)</span>
<span id="cb3-112"><a href="#cb3-112" aria-hidden="true" tabindex="-1"></a><span class="bu">print</span>(<span class="st">"lomont_E - best_E ="</span>, lomont_E <span class="op">-</span> best_E)</span>
<span id="cb3-113"><a href="#cb3-113" aria-hidden="true" tabindex="-1"></a></span>
<span id="cb3-114"><a href="#cb3-114" aria-hidden="true" tabindex="-1"></a></span>
<span id="cb3-115"><a href="#cb3-115" aria-hidden="true" tabindex="-1"></a>zoom_pad <span class="op">=</span> <span class="dv">24</span></span>
<span id="cb3-116"><a href="#cb3-116" aria-hidden="true" tabindex="-1"></a>z0, z1 <span class="op">=</span> <span class="bu">max</span>(<span class="dv">0</span>, best_i <span class="op">-</span> zoom_pad), <span class="bu">min</span>(<span class="bu">len</span>(Cs), best_i <span class="op">+</span> zoom_pad <span class="op">+</span> <span class="dv">1</span>)</span>
<span id="cb3-117"><a href="#cb3-117" aria-hidden="true" tabindex="-1"></a>ZC, ZE <span class="op">=</span> Cs[z0:z1], Es[z0:z1]</span>
<span id="cb3-118"><a href="#cb3-118" aria-hidden="true" tabindex="-1"></a></span>
<span id="cb3-119"><a href="#cb3-119" aria-hidden="true" tabindex="-1"></a>fig, ax <span class="op">=</span> plt.subplots(<span class="dv">1</span>, <span class="dv">2</span>, figsize<span class="op">=</span>(<span class="dv">15</span>, <span class="dv">5</span>))</span>
<span id="cb3-120"><a href="#cb3-120" aria-hidden="true" tabindex="-1"></a></span>
<span id="cb3-121"><a href="#cb3-121" aria-hidden="true" tabindex="-1"></a>ax[<span class="dv">0</span>].plot(Cs.astype(np.int64), Es, color<span class="op">=</span><span class="st">"black"</span>, lw<span class="op">=</span><span class="fl">1.5</span>)</span>
<span id="cb3-122"><a href="#cb3-122" aria-hidden="true" tabindex="-1"></a><span class="cf">for</span> C, name, color <span class="kw">in</span> (</span>
<span id="cb3-123"><a href="#cb3-123" aria-hidden="true" tabindex="-1"></a>    (quake, <span class="st">"Quake"</span>, <span class="st">"tab:blue"</span>),</span>
<span id="cb3-124"><a href="#cb3-124" aria-hidden="true" tabindex="-1"></a>    (lomont, <span class="st">"Lomont"</span>, <span class="st">"tab:orange"</span>),</span>
<span id="cb3-125"><a href="#cb3-125" aria-hidden="true" tabindex="-1"></a>    (best_C, <span class="st">"Best"</span>, <span class="st">"tab:red"</span>),</span>
<span id="cb3-126"><a href="#cb3-126" aria-hidden="true" tabindex="-1"></a>):</span>
<span id="cb3-127"><a href="#cb3-127" aria-hidden="true" tabindex="-1"></a>    ax[<span class="dv">0</span>].axvline(C, color<span class="op">=</span>color, lw<span class="op">=</span><span class="fl">2.5</span>, label<span class="op">=</span><span class="ss">f"</span><span class="sc">{</span>name<span class="sc">}</span><span class="ss"> </span><span class="sc">{</span><span class="bu">hex</span>(C)<span class="sc">}</span><span class="ss">"</span>)</span>
<span id="cb3-128"><a href="#cb3-128" aria-hidden="true" tabindex="-1"></a></span>
<span id="cb3-129"><a href="#cb3-129" aria-hidden="true" tabindex="-1"></a>ax[<span class="dv">1</span>].plot(ZC.astype(np.int64), ZE, color<span class="op">=</span><span class="st">"black"</span>, lw<span class="op">=</span><span class="fl">1.5</span>)</span>
<span id="cb3-130"><a href="#cb3-130" aria-hidden="true" tabindex="-1"></a><span class="cf">for</span> C, name, style <span class="kw">in</span> ((lomont, <span class="st">"Lomont"</span>, <span class="st">"--"</span>), (best_C, <span class="st">"Best"</span>, <span class="st">":"</span>)):</span>
<span id="cb3-131"><a href="#cb3-131" aria-hidden="true" tabindex="-1"></a>    ax[<span class="dv">1</span>].axvline(C, color<span class="op">=</span><span class="st">"black"</span>, ls<span class="op">=</span>style, lw<span class="op">=</span><span class="dv">2</span>, label<span class="op">=</span><span class="ss">f"</span><span class="sc">{</span>name<span class="sc">}</span><span class="ss"> </span><span class="sc">{</span><span class="bu">hex</span>(C)<span class="sc">}</span><span class="ss">"</span>)</span>
<span id="cb3-132"><a href="#cb3-132" aria-hidden="true" tabindex="-1"></a></span>
<span id="cb3-133"><a href="#cb3-133" aria-hidden="true" tabindex="-1"></a><span class="cf">for</span> C <span class="kw">in</span> near_min:</span>
<span id="cb3-134"><a href="#cb3-134" aria-hidden="true" tabindex="-1"></a>    <span class="cf">if</span> <span class="bu">int</span>(ZC[<span class="dv">0</span>]) <span class="op">&lt;=</span> <span class="bu">int</span>(C) <span class="op">&lt;=</span> <span class="bu">int</span>(ZC[<span class="op">-</span><span class="dv">1</span>]):</span>
<span id="cb3-135"><a href="#cb3-135" aria-hidden="true" tabindex="-1"></a>        ax[<span class="dv">1</span>].axvline(<span class="bu">int</span>(C), color<span class="op">=</span><span class="st">"black"</span>, ls<span class="op">=</span><span class="st">"--"</span>, lw<span class="op">=</span><span class="dv">1</span>, alpha<span class="op">=</span><span class="fl">0.45</span>)</span>
<span id="cb3-136"><a href="#cb3-136" aria-hidden="true" tabindex="-1"></a></span>
<span id="cb3-137"><a href="#cb3-137" aria-hidden="true" tabindex="-1"></a><span class="cf">for</span> axis, values, title, rot <span class="kw">in</span> (</span>
<span id="cb3-138"><a href="#cb3-138" aria-hidden="true" tabindex="-1"></a>    (ax[<span class="dv">0</span>], Cs, <span class="st">"Local exhaustive validation"</span>, <span class="dv">35</span>),</span>
<span id="cb3-139"><a href="#cb3-139" aria-hidden="true" tabindex="-1"></a>    (ax[<span class="dv">1</span>], ZC, <span class="st">"Zoom around minimum"</span>, <span class="dv">45</span>),</span>
<span id="cb3-140"><a href="#cb3-140" aria-hidden="true" tabindex="-1"></a>):</span>
<span id="cb3-141"><a href="#cb3-141" aria-hidden="true" tabindex="-1"></a>    hex_ticks(axis, values, rot<span class="op">=</span>rot)</span>
<span id="cb3-142"><a href="#cb3-142" aria-hidden="true" tabindex="-1"></a>    axis.<span class="bu">set</span>(</span>
<span id="cb3-143"><a href="#cb3-143" aria-hidden="true" tabindex="-1"></a>        xlabel<span class="op">=</span><span class="st">"Magic constant"</span>,</span>
<span id="cb3-144"><a href="#cb3-144" aria-hidden="true" tabindex="-1"></a>        ylabel<span class="op">=</span><span class="vs">r"</span><span class="dv">$\m</span><span class="vs">ax_x </span><span class="cf">|</span><span class="vs">1 - </span><span class="er">\</span><span class="vs">hat y</span><span class="dv">\s</span><span class="vs">qrt{x}</span><span class="cf">|</span><span class="dv">$</span><span class="vs">"</span>,</span>
<span id="cb3-145"><a href="#cb3-145" aria-hidden="true" tabindex="-1"></a>        title<span class="op">=</span>title,</span>
<span id="cb3-146"><a href="#cb3-146" aria-hidden="true" tabindex="-1"></a>    )</span>
<span id="cb3-147"><a href="#cb3-147" aria-hidden="true" tabindex="-1"></a>    axis.grid(<span class="va">True</span>)</span>
<span id="cb3-148"><a href="#cb3-148" aria-hidden="true" tabindex="-1"></a>    axis.legend()</span>
<span id="cb3-149"><a href="#cb3-149" aria-hidden="true" tabindex="-1"></a></span>
<span id="cb3-150"><a href="#cb3-150" aria-hidden="true" tabindex="-1"></a>plt.tight_layout()</span>
<span id="cb3-151"><a href="#cb3-151" aria-hidden="true" tabindex="-1"></a>plt.show()</span></code></pre></div></div>
<div class="cell-output cell-output-stdout">
<pre><code>fast: 0x5f375a5e 1597463134 1.750826835632324219e-03

Groups by error score, first 12 sorted:
E=1.751303672790526910e-03 | n=  6 | from=0x5f375a81 to=0x5f375a88
E=1.751363277435302951e-03 | n= 18 | from=0x5f375a77 to=0x5f375a8e
E=1.751422882080077908e-03 | n= 16 | from=0x5f375a6c to=0x5f375a95
E=1.751482486724853949e-03 | n= 15 | from=0x5f375a63 to=0x5f375a9b
E=1.751542091369628906e-03 | n= 15 | from=0x5f375a5b to=0x5f375aa0
E=1.751601696014404080e-03 | n= 16 | from=0x5f375a4e to=0x5f375aa7
E=1.751661300659179904e-03 | n= 15 | from=0x5f375a47 to=0x5f375aad
E=1.751720905303955078e-03 | n= 17 | from=0x5f375a3e to=0x5f375ab3
E=1.751780509948730035e-03 | n= 14 | from=0x5f375a32 to=0x5f375ab8
E=1.751840114593506076e-03 | n= 16 | from=0x5f375a29 to=0x5f375abf
E=1.751899719238281033e-03 | n= 18 | from=0x5f375a1f to=0x5f375ac5
E=1.751959323883057074e-03 | n= 13 | from=0x5f375a16 to=0x5f375aca

Minimum error:
E_min = 1.751303672790527344e-03

Constants reaching exact minimum:
0x5f375a81 1597463169
0x5f375a83 1597463171
0x5f375a85 1597463173
0x5f375a86 1597463174
0x5f375a87 1597463175
0x5f375a88 1597463176

Constants within 1.0e-08 of the minimum:
count = 6
from  = 0x5f375a81 1597463169
to    = 0x5f375a88 1597463176
0x5f375a81 1597463169 1.751303672790527344e-03
0x5f375a83 1597463171 1.751303672790527344e-03
0x5f375a85 1597463173 1.751303672790527344e-03
0x5f375a86 1597463174 1.751303672790527344e-03
0x5f375a87 1597463175 1.751303672790527344e-03
0x5f375a88 1597463176 1.751303672790527344e-03

======================================================================
RESULTS
======================================================================

Quake:
0x5f3759df 1597463007 1.752376556396484375e-03

Lomont:
0x5f375a86 1597463174 1.751303672790527344e-03

Best:
0x5f375a81 1597463169 1.751303672790527344e-03

Differences:
best_C - quake  = 162
best_C - lomont = -5

Error improvements:
quake_E  - best_E = 1.0728836059570312e-06
lomont_E - best_E = 0.0</code></pre>
</div>
<div class="cell-output cell-output-display">
<div>
<figure class="figure">
<p><img src="/blog/generated/notebooks/the-quake3-inverse-square-root-story/figure-html/cell-2-output-2.png" class="img-fluid figure-img"></p>
</figure>
</div>
</div>
</div>
<p>The error landscape around the Quake III magic constant reveals several important observations.</p>
<p>First, the error landscape exhibits a clear basin around the optimum. Since this is a discrete float32 experiment, the curve should not be interpreted as smooth or strongly convex in a rigorous mathematical sense. What matters is that the famous bit hack is not based on a completely arbitrary hexadecimal value, but rather on a carefully tuned numerical approximation.</p>
<p>Second, the original Quake constant:</p>
<p><math display="block" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mtext mathvariant="monospace">𝟶𝚡𝟻𝚏𝟹𝟽𝟻𝟿𝚍𝚏</mtext><annotation encoding="application/x-tex">
\texttt{0x5f3759df}
</annotation></semantics></math></p>
<p>is located quite close to the experimentally observed optimums in this sampled experiment and in the scanned interval, which is what Lomont found :</p>
<p><math display="block" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mtext mathvariant="monospace">𝟶𝚡𝟻𝚏𝟹𝟽𝟻𝚊𝟾𝟷</mtext><mo>→</mo><mtext mathvariant="monospace">𝟶𝚡𝟻𝚏𝟹𝟽𝟻𝚊𝟾𝟾</mtext></mrow><annotation encoding="application/x-tex">
\texttt{0x5f375a81} \to \texttt{0x5f375a88}
</annotation></semantics></math></p>
<p>The difference between the two constants is only <math display="inline" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>162</mn><mo>→</mo><mn>169</mn></mrow><annotation encoding="application/x-tex">162 \to 169</annotation></semantics></math> which represents a negligible perturbation compared to the magnitude of the constant itself. Most importantly, the corresponding approximation errors differ by less than:</p>
<p><math display="block" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><msup><mn>10</mn><mrow><mi>−</mi><mn>6</mn></mrow></msup><annotation encoding="application/x-tex">
10^{-6}
</annotation></semantics></math></p>
<p>after one Newton refinement step. In practice, such a difference is entirely insignificant for real-time 3D rendering applications.</p>
<p>This experiment is consistent with the idea that the Quake constant was obtained through empirical tuning near the theoretical logarithmic approximation:</p>
<p><math display="block" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mtext mathvariant="monospace">𝟶𝚡𝟻𝚏𝟺𝟶𝟶𝟶𝟶𝟶</mtext><annotation encoding="application/x-tex">
\texttt{0x5f400000}
</annotation></semantics></math></p>
<p>followed by local numerical adjustments intended to minimize the inverse square root approximation error.</p>
<p>Finally, the graph highlights a remarkable property of the Quake III trick: despite relying on an apparently mysterious hexadecimal constant, the empirical value chosen for the initialization is extremely close to the best value found in this local scan, but it should not be presented as a proven global optimum over all positive float32 inputs.</p>
</section>
