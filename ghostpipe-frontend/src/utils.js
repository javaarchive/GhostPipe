export function filterFormats(formats){
    return formats.filter(format => {
        return format.ext != "mhtml" && format.ext != "3gp"; // no extremely bad format pls
    })
}
