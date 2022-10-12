


// from https://www.shadertoy.com/view/lslXDr
// Mie
// g : ( -0.75, -0.999 )
//      3 * ( 1 - g^2 )               1 + c^2
// F = ----------------- * -------------------------------
//      8pi * ( 2 + g^2 )     ( 1 + g^2 - 2 * g * c )^(3/2)
float phase_mie( float g, float c, float cc ) {
	float gg = g * g;
	
	float a = ( 1.0 - gg ) * ( 1.0 + cc );

	float b = 1.0 + gg - 2.0 * g * c;
	b *= sqrt( b );
	b *= 2.0 + gg;	
	
	return ( 3.0 / 8.0 / PI ) * a / b;
}

// Rayleigh
// g : 0
// F = 3/16PI * ( 1 + c^2 )
float phase_ray( float cc ) {
	return ( 3.0 / 16.0 / PI ) * ( 1.0 + cc );
}

const int NUM_OUT_SCATTER = 8;
const int NUM_IN_SCATTER = 10;

float density( vec3 p, float ph, float planetRadius ) {
	return exp( -max( length( p ) - planetRadius, 0.0 ) / ph );
}

float optic( vec3 p, vec3 q, float ph, float planetRadius) {
	vec3 s = ( q - p ) / float( NUM_OUT_SCATTER );
	vec3 v = p + s * 0.5;
	
	float sum = 0.0;
	for ( int i = 0; i < NUM_OUT_SCATTER; i++ ) {
		sum += density( v, ph, planetRadius);
		v += s;
	}
	sum *= length( s );
	
	return sum;
}

vec3 in_scatter( vec3 start, vec3 planetOrigin, float planetRadius, float atmosphereRadius, vec3 dir, vec2 sphereRayIntersect, vec3 lightDirection ) {
	const float ph_ray = 0.05;
  const float ph_mie = 0.02;

  const vec3 k_ray = vec3( 3.8, 13.5, 33.1 );
  const vec3 k_mie = vec3( 21.0 );
  const float k_mie_ex = 1.1;
  vec3 o = start - planetOrigin;
  vec3 l = lightDirection;
  vec2 e = sphereRayIntersect;
    
	vec3 sum_ray = vec3( 0.0 );
  vec3 sum_mie = vec3( 0.0 );
    
  float n_ray0 = 0.0;
  float n_mie0 = 0.0;
    
	float len = ( e.y - e.x ) / float( NUM_IN_SCATTER );
  vec3 s = dir * len;
	vec3 v = o + dir * ( e.x + len * 0.5 );
    
  for ( int i = 0; i < NUM_IN_SCATTER; i++, v += s ) {   
		float d_ray = density( v, ph_ray, planetRadius ) * len;
    float d_mie = density( v, ph_mie, planetRadius ) * len;
        
    n_ray0 += d_ray;
    n_mie0 += d_mie;
      
        
    vec2 f = sphere( v, l, planetOrigin, atmosphereRadius);
		vec3 u = v + l * f.y;
        
    float n_ray1 = optic( v, u, ph_ray, planetRadius);
    float n_mie1 = optic( v, u, ph_mie, planetRadius);
		
    vec3 att = exp( - ( n_ray0 + n_ray1 ) * k_ray - ( n_mie0 + n_mie1 ) * k_mie * k_mie_ex );
        
		sum_ray += d_ray * att;
    sum_mie += d_mie * att;
	}
	
	float c  = dot( dir, -l );
	float cc = c * c;
  vec3 scatter =
      sum_ray * k_ray * phase_ray( cc ) +
     	sum_mie * k_mie * phase_mie( -0.78, c, cc );
	
	return 10.0 * scatter;
}