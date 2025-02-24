{ pkgs }: {
    deps = [
        pkgs.nodejs-20_x
        pkgs.nodePackages.typescript-language-server
        pkgs.git
        pkgs.python3
        pkgs.gcc
    ];
    env = {
        LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath [
            pkgs.libuuid
        ];
    };
} 