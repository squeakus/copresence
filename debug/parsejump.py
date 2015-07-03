import json
from matplotlib import pylab

input = '{"moo":5,"blah":10}}'
input2 ='{"eqnstr":"y = 0x^3 + 0.01x^2 + 117.41x + -4539021.21","eqn":"-4539021.20901781,117.41043421251753,0.010957543588592184,-3.3688536884783093e-7","t":26183,"y":69.05230661854148,"data":[26101,99,26119,112,26150,105,26167,92]}'

data = json.loads(input2)
eqn = data['eqn']
eqn = eqn.split(',')
eqn = map(float, eqn)
time = int(data['t'])
samples = data['data']
print eqn

prediction = 0
for power, coeff in enumerate(eqn):
    prediction += coeff * (pow(time,power))

print "prediction", prediction

x ,y = [],[]

for i in range(0, len(samples),2):
    actual = samples[i+1]
    time = samples[i]
    x.append(time)
    y.append(actual)
    result = 0
    for power, coeff in enumerate(eqn):
        result += coeff * (pow(time,power))
    print "actual", actual, "predicted", result

pylab.plot(x,y)
pylab.plot([x[-1],time],[y[-1], prediction], color="r")
pylab.show()

