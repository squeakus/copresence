import json
from matplotlib import pylab

infile = open('realtime.txt','r')

for line in infile:
    data = json.loads(line)
    eqn = data['eqn']
    eqn = eqn.split(',')
    eqn = map(float, eqn)
    latesttime = int(data['t'])
    samples = data['data']
    print "Time:", latesttime

    prediction = 0
    for power, coeff in enumerate(eqn):
        prediction += coeff * (pow(latesttime,power))

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
    pylab.plot([x[-1],latesttime],[y[-1], prediction], color="r")
    pylab.show()

