vcl 4.0;

import directors;

backend worker2 {
    .host = "192.168.131.200"; 
    .port = "80";
}

backend worker {
    .host = "192.168.132.22";
    .port = "80";
}

sub vcl_init {
    new balancer = directors.round_robin();
    balancer.add_backend(worker);
    balancer.add_backend(worker2);
}

sub vcl_hash {
    if (req.url ~ "^/(showuser\.php|showimage\.php)") {
        hash_data(req.url);
    }
}

sub vcl_recv {
#    set req.backend = tsd;
    // Only cache GET or HEAD requests.
    if (req.method != "GET" && req.method != "HEAD") {
        return (pass);
    }

    // Checks for correct path
    if (req.url ~ "^/(showuser\.php|showimage\.php)") {
        return (hash);
    }
}


sub vcl_backend_response {
    // Set a default TTL for all responses served by index.php, including related assets
    if (bereq.url ~ "^/(showuser\.php|showimage\.php)") {
        set beresp.ttl = 1h; // Cache for 1 hour, adjust as needed

        // Force caching if needed, by overriding cache-control headers
        set beresp.http.Cache-Control = "public, max-age=7200";
    }
}


sub vcl_deliver {
    // Debug header to check if the response came from cache
    if (obj.hits > 0) {
        set resp.http.X-Cache = "HIT";
    } else {
        set resp.http.X-Cache = "MISS";
    }
}