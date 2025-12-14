{
  description = "gunshi benchmark between skills vs withoug skills";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    claude-code-overlay.url = "github:ryoppippi/claude-code-overlay";
  };

  outputs = { self, nixpkgs, flake-utils, claude-code-overlay }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        pkgsOverlay = claude-code-overlay.packages.${system};
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = [
            pkgs.bun
            pkgs.typos
            pkgs.typos-lsp
            pkgsOverlay.default
          ];

          shellHook = ''
            echo "StackOne AI Node SDK development environment"

            # find dir including package.json and run "bun install" in each directory excluding node_modules
            find . -type f -name "package.json" -not -path "*/node_modules/*" -execdir bun install \;
          '';
        };
      }
    );
}
