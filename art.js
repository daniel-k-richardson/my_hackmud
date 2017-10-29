function (context, args) {

    if (!(args && Object.keys(args).length)) {

        var message = " Welcome to the "
    }

    var gallery = (function(contex, args) {
        var scripter = args.script

        if (scripter) {
            args.upload = scripter.call(args.args)
        }

        if(Array.isArray(args.upload)) {
            args.upload = args.upload.join("\n")
        }

        args = JSON.parse(JSON.stringify(args))
        const IDENTIFIER = "Gallery"
        const BACKTICK_PLACEHOLDER = "#CCODE#"

        var name = (typeof args.name === "string") ? args.name : undefined
        var option = (typeof args.choose === "string") ? args.choose : undefined
        var ascii = (typeof args.upload === "string") ? args.upload : undefined
        var caller = context.caller

        function _listing() {
            var art = #db.f({"type" : {"$eq" : IDENTIFIER}}, {"uploaded_by":1, "name":1, _id:0 }).array()
            return (art.length > 0) ? art : "The gallery is empty."
        }

        function _view() {
            if (name === undefined) {
                return "No name given"
            }
            var art =  #db.f({$and: [{"type": {"$eq": IDENTIFIER}}, {"name":{ "$eq": name}}]}, {"art": 1, _id: 0}).first()
            return (art) ? art.art.replace(new RegExp(BACKTICK_PLACEHOLDER, 'g'), "`") : "Sorry, we could not find what you are looking for."
        }

        function _upload() {
            if (ascii === undefined) {
                return "No ascii art provided"
            }
            ascii = ascii.replace(new RegExp('`', 'g'), "BACKTICK_PLACEHOLDER")

            #db.i(
                {
                    type: IDENTIFIER,
                    uploaded_by: context.caller,
                    name: name,
                    art: ascii
                }
            )
            return "Upload successful"
        }

        function _remove() {

            if(name === undefined) {
                return "You have not provided the name of the art to remove."
            }

            var target = #db.f({$and: [{"type": {"$eq": IDENTIFIER}}, {"name":{ "$eq": name}}]}).first()

            if (target.uploaded_by === caller) {
                #db.r(target)
                return "Art removed"
            }
            return "You cannot delete art that you have not uploaded"
        }

        function menu() {
            if(option === undefined) {
                return "no menu option given"
            }
            var cases = {
                "listing": _listing,
                "view": _view,
                "upload": _upload,
                "remove": _remove
            }
            return cases[option]()
        }
        return {
            menu: menu,
        }
    })(context, args)

    return gallery.menu()
}
