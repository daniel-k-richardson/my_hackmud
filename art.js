function (context, args) {
    if (!(args && Object.keys(args).length)) {
        return "Welcome to the the Art Gallery.\n" +
            "Use `Nchoose`:\"`Vlisting`\" to see all the art uploaded by users\n" +
            "Use `Nchoose`:\"`Vview`\", `Nname`:\"`V<name of art>`\" to display the art on screen \n" +
            "Use `Nchoose`:\"`Vremove`\", `Nname`:\"`V<name of art>`\" to delete art. NOTE: You can only remove art you have uploaded \n" +
            "Use `Nchoose`:\"`Vupload`\", `Nname`:\"`V<name you want to give your creation>`\", `Nupload`:\"`V<write ascii art here>`\"\n" +
            "Use `Nchoose`:\"`Vupload`\", `Nname`:\"`V<name you want to give your creation>`\", `Nscript`:`V#s.name.script` `Nargs`:{`Nargs`:`V\"value\"`}\n" +
            "For example, ascii.art{`Nart`:\"`Vbread`\"} would be `Nscript`:`V#s.ascii.art` `Nargs`:{`Nart`:`V\"bread\"`}\n"
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

        var name = (typeof args.name === "string") ? args.name : undefined
        var option = (typeof args.choose === "string") ? args.choose : undefined
        var ascii = (typeof args.upload === "string") ? args.upload : undefined
        var caller = context.caller

        function _listing() {
            var art = #db.f({"type" : {"$eq" : IDENTIFIER}},  {"uploaded_by":1, "name":1, _id:0 }).array()
            return (art.length > 0) ? art : "The gallery is empty."
        }

        function _view() {
            if (name === undefined) {
                return "No name given"
            }
            var art =  #db.f({$and: [{"type": {"$eq": IDENTIFIER}}, {"name":{ "$eq": name}}]}, {"art": 1, _id: 0}).first()
            return (art) ? art.art.replace(/#CCODE#/g, "`") : "Sorry, we could not find what you are looking for."
        }

        function _upload() {
            if (ascii === undefined) {
                return "No ascii art provided"
            }

            ascii = ascii.replace(/`/g, "#CCODE#")

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
                "remove": _remove,
            }

            try {
                return cases[option]()
            } catch (err) {
                return "Please `Nchoose`: `Vlisting`, `Vview`, `Vupload`, `Vremove`"
            }
        }
        return {
            menu: menu,
        }
    })(context, args)

    return gallery.menu()
}
