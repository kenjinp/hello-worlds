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
    
    float a = 6.000; // fog exponent
	  // const float b = radius; // sphere radius
    float c = radius; // fog strength

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

// vec3 applyFog( in vec3  rgb,      // original color of the pixel
//     in float distance, // camera to point distance
//     in vec3  rayOri,   // camera position
//     in vec3  rayDir )  // camera to point vector
// {
//     float a = 1.\;
//     float b = 10.;
//     float fogAmount = (a/b) * exp(-rayOri.y*b) * (1.0-exp( -distance*rayDir.y*b ))/rayDir.y;
//     vec3  fogColor  = vec3(0.5,0.6,0.7);
//     return mix( rgb, fogColor, fogAmount );
// }

vec3 applyFog( in vec3  rgb,      // original color of the pixel
               in float distance, // camera to point distance
               in vec3  rayDir,   // camera to point vector
               in vec3  sunDir )  // sun light direction
{
    float b = 10.;
    float fogAmount = 1.0 - exp( -distance*b );
    float sunAmount = max( dot( rayDir, sunDir ), 0.0 );
    vec3  fogColor  = mix( vec3(0.5,0.6,0.7), // bluish
                           vec3(1.0,0.9,0.7), // yellowish
                           pow(sunAmount,8.0) );
    return mix( rgb, fogColor, fogAmount );
}

//Based on: https://iquilezles.org/articles/fog
vec3 fog(vec3 ro, vec3 rd, vec3 col, vec3 lgt, float ds)
{
    vec3 pos = ro + rd*ds;
    float mx = 1.0;
    
    const float b= 1.;
    float den = 0.3*exp(-ro.y*b)*(1.0-exp( -ds*rd.y*b ))/rd.y;
    float sdt = max(dot(rd, lgt), 0.);
    vec3  fogColor  = mix(vec3(0.5,0.2,0.15)*1.2, vec3(1.1,0.6,0.45)*1.3, pow(sdt,2.0)+mx*0.5);
    return mix( col, fogColor, clamp(den + mx, 0., 1.) );
}
