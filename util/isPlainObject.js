module.exports=function (o) {
    return o && 'object' === typeof o && !Array.isArray(o)
}
