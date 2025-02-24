{ pkgs }: {
    deps = [
        pkgs.nodejs-20_x
        pkgs.nodePackages.typescript-language-server
        pkgs.nodePackages.typescript
        pkgs.nodePackages.yarn
        pkgs.git
    ];
    env = {
        LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath [
            pkgs.libuuid
        ];
    };
} 