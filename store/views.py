from django.shortcuts import render
from rest_framework import generics
# from rest_framework.permissions import IsAdminUser
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response


from .serializers import *


"""                 //////////////////\\\\\\\\\\\\\\\\\\
                   (||||||||||||[[( AUTH )]]||||||||||||)
                    \\\\\\\\\\\\\\\\\\//////////////////
"""

def registerUser(request):
    username = request.POST['username']
    password = request.POST['password1']
    user = User.objects.create_user(username, username, password)

    login(request, user)
    return HttpResponseRedirect(request.META.get('HTTP_REFERER'))


def loginUser(request):
    username = request.POST['username']
    password = request.POST['password']
    user = authenticate(request, username=username, password=password)
    response_data = {}
    if user is not None:
        if user.is_active:
            login(request, user)
            response_data['result'] = 'success'
        else:
            return HttpResponse("Inactive user.")
    else:
        response_data['result'] = 'fail'

    # return HttpResponse(json.dumps(response_data), content_type="application/json")
    return HttpResponseRedirect(request.META.get('HTTP_REFERER'))


def logoutUser(request):
    if request.method == 'POST':
        logout(request)
        return HttpResponseRedirect(request.META.get('HTTP_REFERER'))




"""                 ////////////////// \\\\\\\\\\\\\\\\\\
                   (||||||||||||[[( PAGES )]]||||||||||||)
                    \\\\\\\\\\\\\\\\\\ //////////////////
"""
def checkout(request):
    if request.user.is_authenticated:
        customer = request.user.customer
        order, created = Order.objects.get_or_create(customer=customer, complete=False)
        items = order.items.all()
    else:
        items = []
        order = {"get_cart_total": 0, "get_cart_items": 0}

    context = {"items": items, "order": order}
    return render(request, 'store/checkout.html', context)




"""                 //////////////////\\\\\\\\\\\\\\\\\\
                   (||||||||||||[[( APIs )]]||||||||||||)
                    \\\\\\\\\\\\\\\\\\//////////////////
"""

class ListProducts(generics.ListAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

# class CreateProduct(generics.CreateAPIView):
#     queryset = Product.objects.all()
#     serializer_class = ProductSerializer
#     permission_classes = [IsAdminUser]

# class RUDProduct(generics.RetrieveUpdateDestroyAPIView):
#     queryset = Product.objects.all()
#     serializer_class = ProductSerializer
#     permission_classes = [IsAdminUser]

# class RUDCart(generics.RetrieveUpdateDestroyAPIView):
#     queryset = Customer.objects.all()
#     serializer_class = CartSerializer

@api_view(['GET'])
def getCart(request, pk):
    try:
        cart = Order.objects.filter(customer=pk).get(complete=False)
        serializer = OrderSerializer(cart)
        return Response(serializer.data)
    except Order.DoesNotExist:
        return JsonResponse({'items':[]}, safe=False)

@api_view(['POST'])
def addItem(request):
    customerId = request.data["userId"]
    productId = request.data["id"]

    product = Product.objects.get(id=productId)
    customer = Customer.objects.get(id=customerId)
    
    order, _ = Order.objects.get_or_create(customer=customer, complete=False)

    orderItem, createdI = OrderItem.objects.get_or_create(order=order, product=product)
    if createdI:
        orderItem.quantity = request.data["moq"]
    else:
        orderItem.quantity = orderItem.quantity + 1
    
    orderItem.save()

    # return JsonResponse({cartCount: order.get_cart_items}, safe=False)
    return JsonResponse({"iId": orderItem.id})


@api_view(['POST'])
def updateItem(request):
    customerId = request.data["userId"]
    itemId = request.data["itemId"]
    newValue = request.data["n"]

    orderItem = OrderItem.objects.get(id=itemId)
    order = Order.objects.get(id=orderItem.order.id)

    if order.complete == False and int(customerId) == order.customer.id:
        orderItem.quantity = newValue
        orderItem.save()
        return JsonResponse({"quantity": orderItem.quantity})
    
    return JsonResponse("error in updateItem", safe=False)


@api_view(['POST'])
def removeItem(request):
    customerId = request.data["userId"]
    itemId = request.data["itemId"]

    orderItem = OrderItem.objects.get(id=itemId)
    order = Order.objects.get(id=orderItem.order.id)

    if order.complete == False and int(customerId) == order.customer.id:
        orderItem.delete()
        return JsonResponse("Removed", safe=False)

    return JsonResponse("error in removeItem", safe=False)