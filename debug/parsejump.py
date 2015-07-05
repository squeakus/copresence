import json
from matplotlib import pylab

oldinput ='{"eqnstr":"y = 0x^3 + 0.01x^2 + 117.41x + -4539021.21","eqn":"-4539021.20901781,117.41043421251753,0.010957543588592184,-3.3688536884783093e-7","t":26183,"y":69.05230661854148,"data":[26101,99,26119,112,26150,105,26167,92]}'

newinput = '{"eqnstr":"y = 0x^3 + 0.44x^2 + -3743.83x + 10637814.6","eqn":"10637814.598265937,-3743.829223117147,0.4391900077286906,-0.000017173642347084638","t":8567,"y":-17.41246024146676,"data":[8493,-19,8515,-18,8534,-18,8556,-17]}'

data = json.loads(newinput)
eqn = data['eqn']
eqn = eqn.split(',')
eqn = map(float, eqn)
ntime = int(data['t'])
samples = data['data']
print data['eqnstr']

#eqn = [7.3799437536430806e+006,-2.5972813033098000e+003,3.0468839966462430e-001,-1.1914200458619078e-005]

eqn = [640455, -225.4543457, 2.645102143e-2,-1.034311936e-6] 

print eqn

prediction = 0
for power, coeff in enumerate(eqn):
    prediction += coeff * (pow(ntime,power))

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
pylab.plot([x[-1],ntime],[y[-1], prediction], color="r")
pylab.show()

