vcl 4.0;

backend default {
    .host = "127.0.0.1";
    .port = "3001";
}

sub vcl_recv {
    return (hash);
}

sub vcl_backend_response {
    set beresp.ttl = 3600s;
    return (deliver);
}

sub vcl_deliver {
    # Set headers to indicate whether the content was served from cache
    if (obj.hits > 0) {
        set resp.http.X-Cache = "HIT";
    } else {
        set resp.http.X-Cache = "MISS";
    }

    return (deliver);
}
