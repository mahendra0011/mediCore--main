Get-ChildItem -Path client -Recurse -Include *.js, *.jsx, *.ts, *.tsx, *.css, *.html, *.json, *.md -Exclude node_modules, .git | ForEach-Object {
     = Get-Content .FullName -Raw
    if ( -imatch 'medicare') {
         =  -ireplace 'medicare', 'mediCore'
        Set-Content -Path .FullName -Value  -Encoding UTF8
    }
}
