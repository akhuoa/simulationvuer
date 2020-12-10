# Data

The data can be generated using the following [`Zsh`](https://www.zsh.org/):

```zsh
[OpenCOR]/pythonshell [SimulationVuer]/scripts/run.py 0 0 > [SimulationVuer]/data/sinus.json
for ((i = 0; i <= 10; ++i)); do a=$(($i/10)); b=$(($i%10)); l=$a.$b; [OpenCOR]/pythonshell [SimulationVuer]/scripts/run.py 1 $l > [SimulationVuer]/data/stellate_$l.json; done
for ((i = 0; i <= 10; ++i)); do a=$(($i/10)); b=$(($i%10)); l=$a.$b; [OpenCOR]/pythonshell [SimulationVuer]/scripts/run.py 2 $l > [SimulationVuer]/data/vagal_$l.json; done
```
