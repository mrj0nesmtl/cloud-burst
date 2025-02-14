nix:replit.nix
{ pkgs }: {
    deps = [
        pkgs.nodejs-18_x
        pkgs.nodePackages.typescript-language-server
        pkgs.nodePackages.typescript
        pkgs.yarn
        pkgs.replitPackages.jest
        pkgs.git
        pkgs.openssh
    ];
    env = {
        LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath [
            pkgs.libuuid
        ];
    };
}