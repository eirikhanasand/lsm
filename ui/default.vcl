vcl 4.0;

backend default {
    .host = "127.0.0.1";
    .port = "3001";
}

sub vcl_recv {
    if (req.http.Cookie) {
        set req.http.X-Theme = regsub(req.http.Cookie, ".*theme=([^;]+);?.*", "\1");
    }

    if (req.url ~ "^/dashboard/(allow|block|repositories/config)") {
        return (pass);
    }

    return (hash);
}

sub vcl_hash {
    # Hashes the theme
    hash_data(req.http.X-Theme);
}

sub vcl_backend_response {
    set beresp.http.Cache-Control = "lsm-cache, max-age=52w";
    set beresp.ttl = 52w;
    return (deliver);
}

sub vcl_deliver {
    if (obj.hits > 0) {
        set resp.http.X-Cache = "HIT:" + obj.hits;
    } else {
        set resp.http.X-Cache = "MISS";
    }

    return (deliver);
}
