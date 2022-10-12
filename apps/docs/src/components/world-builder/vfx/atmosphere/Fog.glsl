// approximation of the error function
// https://github.com/libretro/glsl-shaders/blob/master/blurs/blur9fast-vertical.glsl
float erf( in float x ) {
    //return tanh(1.202760580 * x);
	float sign_x = sign(x);
	float t = 1.0/(1.0 + 0.47047*abs(x));
	float result = 1.0 - t*(0.3480242 + t*(-0.0958798 + t*0.7478556))*exp(-(x*x));
	return result * sign_x;
}

// analytical volumetric fog applied around a sphere
// similar to https://iquilezles.org/articles/fog
float getFog( in vec3 start, in vec3 dir, in float dist, in float radius, in vec3 origin) {
    
    const float a = 6.000; // fog exponent
	  // const float b = radius; // sphere radius
    const float c = 50000.0; // fog strength

    vec3 offset = start - origin;

    float k = offset.x;
    float l = dir.x;
    float m = offset.y;
    float n = dir.y;
    float o = offset.z;
    float p = dir.z;
    float d = dot(offset, dir);

    float res = exp(radius-a*(+k*k*(n*n+p*p)
                         -m*m*(-1.0+n*n)
                         -o*o*(-1.0+p*p)
                         -2.0*k*l*o*p
                         -2.0*m*n*(k*l+o*p) ));
    res *= erf( sqrt(a)*(d+dist) ) - erf( sqrt(a)*d );
    res *= (0.5/sqrt(a)) * sqrt(PI) * c;
    
    return res;
    
}