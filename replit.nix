nix:replit.nix
{ pkgs }: {
    deps = [
        pkgs.nodejs-20_x
        pkgs.python3
        pkgs.gcc
        pkgs.git
        pkgs.nodePackages.npm
        pkgs.nodePackages.typescript
        pkgs.nodePackages.yarn
    ];
    env = {
        LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath [
            pkgs.libuuid
        ];
    };
}