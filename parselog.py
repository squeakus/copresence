import pylab as P
import numpy as np
import sys

SHOWGRAPH = True #Show graphs after saving to a file

def main():
    # User must specify which log
    if len(sys.argv) != 2:
        print "usage: python parselog.py <logname>"
        exit()
    logname = sys.argv[1].rstrip('.txt')
    logfile = open(sys.argv[1], 'r')

    # Here is what the columns define
    columns = ['servertime', 'clienttime', 'player', 'position', 'lag', 'lastknown', 'predictor', 'prediction']
    predictors = ["None", "Linear", "Weighted", "polynomial", "scaledpoly"]
    lag = None
    predictor = "None"

    #dictionary stores player information
    player1 = {'time':[], 'posx':[], 'posy':[], 'vecx':[0], 'vecy':[], 
               'last':[], 'pred':[]}
    player2 = {'time':[], 'posx':[], 'posy':[], 'vecx':[0], 'vecy':[],
               'last':[], 'pred':[]}

    linecount = 0
    for line in logfile:
        linecount += 1
        line = line.split(';')
        player = int(line[2])

        # lag should be the same for every datapoint and user
        if int(line[4]) != lag:
            lag = int(line[4])
            print "Lag value is now set at: ", lag

        # predictor should be the same for every datapoint and user
        if predictors[int(line[6])] != predictor:
            predictor = predictors[int(line[6])]
            print "Predictor being used is: ", predictor

        # parse info for each player separately
        if player == 0:
            player1['time'].append(int(line[1]))
            # if no player position info then use previous value
            if line[3] == 'undefined':
                player1['posx'].append(float('nan'))
                player1['posy'].append(float('nan'))
            else:
                position=[int(round(float(x),0)) for x in line[3].split(',')]
                #we need a position before we calculate vector change
                if linecount > 1:
                    #calculate the vectors BEFORE appending position
                    player1['vecx'].append(position[0] - player1['posx'][-1])
                    player1['vecy'].append(position[1] - player1['posy'][-1])

                player1['posx'].append(position[0])
                player1['posy'].append(position[1])

            lastknown=[round(float(x),0) for x in line[5].split(',')]
            pred=[round(float(x),0) for x in line[7].split(',')]

            player1['last'].append(lastknown[:-1])
            player1['pred'].append(pred)

        # Parse second player
        if player == 1:
            player2['time'].append(int(line[1]))
            if line[3] == 'undefined':
                player2['posx'].append(float('nan'))
                player2['posy'].append(float('nan'))
            else:
                position=[int(round(float(x),0)) for x in line[3].split(",")]
                player2['posx'].append(position[0])
                player2['posy'].append(position[1])
                
            lastknown=[round(float(x),0) for x in line[5].split(',')]
            pred=[round(float(x),0) for x in line[7].split(',')]
            player2['last'].append(lastknown[:-1])
            player2['pred'].append(pred)

    # Each pplayer may have a different number of points
    print "p1 data points:", len(player1['posx'])
    print "p2 data points:", len(player2['posx'])

    # plot the knowns
    # plotpositions(logname, player1, player2)
    # plotchangerate(logname, player1, player2)
    # plothistogram(logname, player1, "Player 1 X distributions", "_xhist.png")
    #plothistogram(logname, player1, "Player 1 X distributions", "_xhist.png")

    ploterror(logname, player1, player2)
    if not predictor == "None":
        print "plotting prediction error"
    else:
        print "no prediction to plot" 

def plotchangerate(logname, p1, p2):
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
    P.title("Rate of Change")
    P.xlabel('Time (ms)')
    P.ylabel('Rate of Change')
    P.savefig(logname+"_rateofchange.png")

    if SHOWGRAPH:
        P.show()

def plothistogram(logname, p1, title, filename):
    vals = [x for x in p1['vecx'] if str(x) != 'nan']
    n, bins, patches = P.hist(vals, 50, histtype='stepfilled')

    P.title(title)
    P.xlabel('X Coordinate vals')
    P.ylabel('Frequency')
    P.savefig(logname+filename)
    if SHOWGRAPH:
        P.show()

def ploterror(logname, p1, p2):
    alltime, allerr = [],[]
    for idx in range(len(p1['time'])):
        last = np.matrix(p1['last'][idx])
        pred = np.matrix(p1['pred'][idx])
        error = np.sum(abs(pred-last))
        print last, pred, error
        time = p1['time'][idx]
        if error < 1000:
            allerr.append(error)
            alltime.append(time)

    P.plot(alltime, allerr, label='Player 1 prediction error', linewidth=2)

    P.title("Summed Prediction Error")
    P.xlabel('X Coordinate')
    P.ylabel('Y Coordinate')
    P.legend()
    P.savefig(logname+"_prederr.png")

    if SHOWGRAPH:
        P.show()

# show player positions during recording
def plotpositions(logname, p1, p2):
    P.plot(p1['posx'], p1['posy'], label='Player 1', linewidth=2)
    P.plot(p2['posx'], p2['posy'], label='Player 2', linewidth=2)

    P.title("Player positions")
    P.xlabel('X Coordinate')
    P.ylabel('Y Coordinate')

    P.legend()
    P.savefig(logname+"_positions.png")
    if SHOWGRAPH:
        P.show()

if __name__ == '__main__':
    main()
