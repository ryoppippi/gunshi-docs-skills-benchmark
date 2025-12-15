{
  description = "gunshi benchmark between skills vs without skills";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-parts.url = "github:hercules-ci/flake-parts";
    claude-code-overlay.url = "github:ryoppippi/claude-code-overlay";
  };

  outputs = inputs@{ flake-parts, ... }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      systems = [ "x86_64-linux" "aarch64-linux" "x86_64-darwin" "aarch64-darwin" ];

      perSystem = { pkgs, system, ... }:
        let
          pkgsOverlay = inputs.claude-code-overlay.packages.${system};
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

              # find dir including package.json and run "bun ci" in each directory excluding node_modules
              find . -type f -name "package.json" -not -path "*/node_modules/*" -execdir bun ci \;
            '';
          };
        };
    };
}
