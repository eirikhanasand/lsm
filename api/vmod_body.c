#include <stdlib.h>
#include <string.h>
#include <vrt.h>
#include <cache/cache.h>
#include <vcc_if.h>

int init_function(struct vmod_priv *priv, const struct VCL_conf *conf) {
    return (0);
}

VCL_STRING vmod_read_body(const struct vrt_ctx *ctx) {
    struct req *req;
    char *body;
    unsigned bodylen;

    req = ctx->req;

    // Get Content-Length
    const char *content_length = VRT_GetHdr(ctx, HDR_REQ, "\017Content-Length:");
    if (content_length == NULL)
        return NULL;

    bodylen = strtoul(content_length, NULL, 10);
    if (bodylen == 0)
        return NULL;

    // Allocate memory in workspace
    body = WS_Alloc(req->ws, bodylen + 1);
    if (body == NULL)
        return NULL;

    // Read the body
    if (HTC_Read(req->htc, body, bodylen) != bodylen)
        return NULL;

    // Null-terminate the body
    body[bodylen] = '\0';
    return body;
}
