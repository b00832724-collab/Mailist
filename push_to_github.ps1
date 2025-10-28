param(
  [string]$RemoteUrl = "https://github.com/b00832724-collab/Mailist.git",
  [string]$Branch = "main"
)

Write-Host "Push helper  repository local -> remote"
if (-not (Get-Command git -ErrorAction SilentlyContinue)){
  Write-Error "git n'est pas installé ou n'est pas disponible dans le PATH. Installez Git et relancez."; exit 1
}

# Init repo if missing
if (-not (Test-Path -Path .git)){
  git init
  Write-Host "Dépôt git initialisé"
} else { Write-Host "Dépôt git déjà initialisé" }

# Add files and commit
git add .
try { git commit -m "Initial scaffold: front-end prototype" } catch { Write-Host "Aucun changement à committer ou commit déjà présent." }

# Ensure branch
git branch -M $Branch

# Add or update remote
$existing = git remote get-url origin 2>$null
if ($LASTEXITCODE -eq 0) {
  git remote set-url origin $RemoteUrl
  Write-Host "Remote 'origin' mis à jour -> $RemoteUrl"
} else {
  git remote add origin $RemoteUrl
  Write-Host "Remote 'origin' ajouté -> $RemoteUrl"
}

Write-Host "Poussée vers origin/$Branch (vous serez probablement invité à vous authentifier)..."
# Push (may prompt for credentials or rely on credential manager)
git push -u origin $Branch

if ($LASTEXITCODE -eq 0) { Write-Host "Push réussi." } else { Write-Error "Échec du push. Vérifiez vos droits ou l'URL du remote et réessayez." }
