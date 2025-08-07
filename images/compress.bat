@echo off
mkdir compressed
for %%f in (*.jpg) do (
    magick "%%f" -quality 75 "compressed\%%~nxf"
)
for %%f in (*.jpeg) do (
    magick "%%f" -quality 75 "compressed\%%~nxf"
)
echo Compessing complete!
pause
