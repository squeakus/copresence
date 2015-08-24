import pylab as P

def main():
    logfile = open('testlog.txt','r')
    columns = ['servertime', 'clienttime', 'player', 'position', 'lag', 'lastknown', 'predictor', 'prediction']
    predictors = ["None", "Linear", "Weighted", "polynomial", "scaledpoly"]

    player1 = {'time':[], 'posx':[], 'posy':[],}
    player2 = {'time':[], 'posx':[], 'posy':[],}

    linecount = 0
    p1started = False
    p2started = False

    for line in logfile:
        line = line.split(';')
        player = int(line[2])

        # ignore the initial lines if they are undefined
        if line[3]== 'undefined':
            if not p1started or not p2started:
                print "waiting until start"
                continue
        elif player == 0:
            p1started = True
        elif player == 1:
            p2started = True

        #line = line.replace('undefined', '0,0,0')
        
        # parse info for each player separately
        if player == 0:
            # if no player position info then use previous value
            if line[3] == 'undefined':
                player1['posx'].append(player1['posx'][-1])
                player1['posy'].append(player1['posy'][-1])
            else:
                position = [int(round(float(x),0)) for x in line[3].split(",")]
                player1['posx'].append(position[0])
                player1['posy'].append(position[1])
            player1['time'].append(int(line[1]))

        if player == 1:
            if line[3] == 'undefined':
                player2['posx'].append(player2['posx'][-1])
                player2['posy'].append(player2['posy'][-1])
            else:
                position = [int(round(float(x),0)) for x in line[3].split(",")]
                player2['posx'].append(position[0])
                player2['posy'].append(position[1])
            player2['time'].append(int(line[1]))


    print "p1", len(player1['posx'])
    print "p2", len(player2['posx'])
    #plotpositions(player1, player2)
    plotchangerate(player1, player2)

def plotchangerate(p1,p2):
    p1time = []
    p1changerate = [] 
    for i in range(len(p1['posx'])-1):
        xdiff = abs(p1['posx'][i] - p1['posx'][i+1])
        ydiff = abs(p1['posy'][i] - p1['posy'][i+1])
        totaldiff = xdiff + ydiff

        p1time.append(p1['time'][i+1])
        p1changerate.append(totaldiff)

    P.plot(p1time, p1changerate, label='Player 1 change rate', linewidth=2)

    p2time = []
    p2changerate = [] 
    for i in range(len(p2['posx'])-1):
        xdiff = abs(p2['posx'][i] - p2['posx'][i+1])
        ydiff = abs(p2['posy'][i] - p2['posy'][i+1])
        totaldiff = xdiff + ydiff

        p2time.append(p2['time'][i+1])
        p2changerate.append(totaldiff)

    P.plot(p2time, p2changerate, label='Player 2 change rate', linewidth=2)
    P.legend()
    P.show()


#def plotdifference(p1,p2):
    


def plotpositions(p1, p2):
    P.plot(p1['posx'], p1['posy'], label='Player 1', linewidth=2)
    P.plot(p2['posx'], p2['posy'], label='Player 2', linewidth=2)

    #P.axis([0, 10, 0, 10])
    P.legend()
    P.show()
    P.figure()

if __name__=='__main__':
    main()
