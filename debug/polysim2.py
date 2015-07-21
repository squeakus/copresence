import numpy as np
import matplotlib.pyplot as plt
import random
#x = [1,2,3,4]
#y = [1,2,1,1]

random.seed(0)

x = np.array([0.0, 10.0, 20.0, 30.0,  40.0,  50.0])
y = np.array([0.0, 0.8, 0.9, 0.1, -0.8, -1.0])

z = np.polyfit(x, y, 3)
p = np.poly1d(z)
print "coeffs:", z
print "P3: ", p
print "P(0.5)", p(5)


for j in range(10):
    #show predictions
    for i in range(10):
        xp = np.linspace(0, x[-1]+i, 100)
        _ = plt.plot(x, y, '.', xp, p(xp), '-')
        plt.ylim(-2,2)
        filename = "img%03d.png"% (x[-1]+i)
        plt.savefig(filename)
        #plt.show()

    #add some new positions and recalc predictor
    x = np.append(x,x[-1]+10)
    y = np.append(y,y[-1] + random.uniform(-0.2, 0.2))
    #y = np.append(y,y[-1] + 0.05)
    z = np.polyfit(x[-4:], y[-4:], 3)
    p = np.poly1d(z)

print x
print y
