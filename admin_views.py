# auctions/admin_views.py
from django.shortcuts import redirect, get_object_or_404
from django.contrib.admin.views.decorators import staff_member_required
from .models import AuctionItem, Bid, Dispute
from rest_framework import generics, permissions, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth import get_user_model
from django.db.models import Sum, Count, Q
from .serializers import DisputeSerializer, AuctionItemSerializer
from django.utils.timezone import now, timedelta
from django.db.models.functions import TruncDay
from rest_framework.pagination import PageNumberPagination
from django.core.cache import cache

User = get_user_model()

class AdminPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100

class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and (request.user.is_staff or request.user.is_superuser)


# ========== AUCTION MANAGEMENT ==========

class AdminAuctionListView(generics.ListAPIView):
    """
    Admin endpoint to list all auctions with advanced filtering
    GET /admin/auctions/
    
    Query Parameters:
    - search: Search by item_name, description, seller email
    - status: Filter by status (active, closed, pending, cancelled)
    - category: Filter by category
    - condition: Filter by condition
    - start_date: Filter auctions starting after this date
    - end_date: Filter auctions ending before this date
    - page: Page number
    - page_size: Results per page (default 20)
    """
    serializer_class = AuctionItemSerializer
    permission_classes = [IsAdminUser]
    pagination_class = AdminPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['item_name', 'description', 'seller__email', 'seller__first_name', 'seller__last_name']
    ordering_fields = ['start_time', 'end_time', 'starting_price', 'current_price', 'id']
    ordering = ['-start_time']

    def get_queryset(self):
        queryset = AuctionItem.objects.select_related('seller', 'winner').prefetch_related('images', 'bids').all()
        
        # Status filter
        status = self.request.query_params.get('status', None)
        if status:
            queryset = queryset.filter(status=status)
        
        # Category filter
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category=category)
        
        # Condition filter
        condition = self.request.query_params.get('condition', None)
        if condition:
            queryset = queryset.filter(condition=condition)
        
        # Date range filters
        start_date = self.request.query_params.get('start_date', None)
        if start_date:
            queryset = queryset.filter(start_time__gte=start_date)
        
        end_date = self.request.query_params.get('end_date', None)
        if end_date:
            queryset = queryset.filter(end_time__lte=end_date)
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def close_auction_api(request, auction_id):
    """
    Close an active auction and determine winner
    POST /admin/close-auction/<auction_id>/
    """
    try:
        auction = get_object_or_404(AuctionItem, id=auction_id)
        
        if auction.status == "closed":
            return Response({
                'success': False,
                'error': 'Auction is already closed'
            }, status=400)
        
        # Close the auction (this will determine winner)
        auction.close()
        
        winner_info = None
        winning_amount = 0
        
        if auction.winner:
            winner_info = f"{auction.winner.first_name} {auction.winner.last_name} ({auction.winner.email})".strip()
            if not winner_info or winner_info == " ()":
                winner_info = auction.winner.email
            winning_amount = float(auction.current_price)
        
        return Response({
            'success': True,
            'message': 'Auction closed successfully',
            'auction_id': auction.id,
            'status': auction.status,
            'winner': winner_info or 'No bids placed',
            'winning_amount': winning_amount
        })
    
    except Exception as e:
        import traceback
        print(f"Error closing auction: {str(e)}")
        print(traceback.format_exc())
        return Response({
            'success': False,
            'error': str(e)
        }, status=500)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def reopen_auction_api(request, auction_id):
    """
    Reopen a closed auction
    POST /admin/reopen-auction/<auction_id>/
    """
    try:
        auction = get_object_or_404(AuctionItem, id=auction_id)
        
        if auction.status != "closed":
            return Response({
                'success': False,
                'error': 'Only closed auctions can be reopened'
            }, status=400)
        
        # Reopen the auction
        auction.status = "active"
        auction.winner = None
        auction.save()
        
        return Response({
            'success': True,
            'message': 'Auction reopened successfully',
            'auction_id': auction.id,
            'status': auction.status
        })
    
    except Exception as e:
        import traceback
        print(f"Error reopening auction: {str(e)}")
        print(traceback.format_exc())
        return Response({
            'success': False,
            'error': str(e)
        }, status=500)


# Keep the original staff_member_required function for Django admin interface
@staff_member_required
def close_auction(request, auction_id):
    """
    Django admin interface function for closing auctions
    """
    auction = get_object_or_404(AuctionItem, id=auction_id)
    if auction.status != "closed":
        auction.close()
    return redirect(f"/admin/auctions/auctionitem/{auction_id}/change/")


# ========== REPORTS & ANALYTICS ==========

class AdminReportView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        try:
            total_users = User.objects.count()
            total_auctions = AuctionItem.objects.count()
            active_auctions = AuctionItem.objects.filter(status="active").count()
            total_bids = Bid.objects.count()
            
            # Use current_price sum for closed auctions
            total_revenue = AuctionItem.objects.filter(status="closed").aggregate(
                Sum("current_price")
            )["current_price__sum"] or 0

            return Response({
                "total_users": total_users,
                "total_auctions": total_auctions,
                "active_auctions": active_auctions,
                "total_bids": total_bids,
                "total_revenue": float(total_revenue),
            })
        except Exception as e:
            import traceback
            print(f"Reports error: {str(e)}")
            print(traceback.format_exc())
            return Response(
                {"error": str(e), "detail": "Failed to fetch reports"},
                status=500
            )


class AdminAnalyticsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        try:
            # Bids per day (last 7 days)
            last_week = now() - timedelta(days=7)
            bids_per_day = (
                Bid.objects.filter(created_at__gte=last_week)
                .annotate(day=TruncDay("created_at"))
                .values("day")
                .annotate(count=Count("id"))
                .order_by("day")
            )

            # Convert to list and format dates
            bids_data = []
            for item in bids_per_day:
                bids_data.append({
                    "day": item["day"].strftime("%Y-%m-%d") if item["day"] else "",
                    "count": item["count"]
                })

            # Auctions by category
            auctions_by_category = []
            try:
                category_data = (
                    AuctionItem.objects.values("category")
                    .annotate(count=Count("id"))
                    .order_by("-count")
                )
                for item in category_data:
                    auctions_by_category.append({
                        "category__name": item["category"],
                        "count": item["count"]
                    })
            except Exception as e:
                print(f"Category aggregation error: {e}")
                auctions_by_category = []

            # Revenue trend (last 30 days)
            last_month = now() - timedelta(days=30)
            revenue_trend = (
                AuctionItem.objects.filter(
                    status="closed", 
                    end_time__gte=last_month
                )
                .annotate(day=TruncDay("end_time"))
                .values("day")
                .annotate(total=Sum("current_price"))
                .order_by("day")
            )

            revenue_data = []
            for item in revenue_trend:
                revenue_data.append({
                    "day": item["day"].strftime("%Y-%m-%d") if item["day"] else "",
                    "total": float(item["total"]) if item["total"] else 0
                })

            data = {
                "bids_per_day": bids_data,
                "auctions_by_category": auctions_by_category,
                "revenue_trend": revenue_data,
            }

            return Response(data)

        except Exception as e:
            import traceback
            print(f"Analytics error: {str(e)}")
            print(traceback.format_exc())
            
            return Response(
                {
                    "bids_per_day": [],
                    "auctions_by_category": [],
                    "revenue_trend": [],
                    "error": str(e)
                },
                status=200
            )


# ========== DISPUTE MANAGEMENT ==========

class DisputeListView(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        try:
            disputes = Dispute.objects.all().order_by("-created_at")
            
            dispute_data = []
            for dispute in disputes:
                dispute_data.append({
                    "id": dispute.id,
                    "order": {
                        "id": dispute.order.id if hasattr(dispute, 'order') else None,
                        "auction": {
                            "item_name": dispute.order.auction.item_name if hasattr(dispute.order, 'auction') else None
                        } if hasattr(dispute, 'order') else {}
                    },
                    "raised_by": {
                        "email": dispute.raised_by.email if dispute.raised_by else None
                    },
                    "against": {
                        "email": dispute.against.email if dispute.against else None
                    },
                    "status": dispute.status,
                    "created_at": dispute.created_at.isoformat(),
                    "resolved_at": dispute.resolved_at.isoformat() if dispute.resolved_at else None,
                })
            
            return Response({
                "results": dispute_data,
                "count": len(dispute_data)
            })
        except Exception as e:
            print(f"Dispute list error: {str(e)}")
            return Response(
                {"results": [], "count": 0, "error": str(e)},
                status=200
            )


class DisputeDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAdminUser]
    
    def get(self, request, pk):
        try:
            dispute = Dispute.objects.get(pk=pk)
            
            dispute_data = {
                "id": dispute.id,
                "order": {
                    "id": dispute.order.id if hasattr(dispute, 'order') else None,
                    "amount": float(dispute.order.amount) if hasattr(dispute.order, 'amount') else 0,
                    "created_at": dispute.order.created_at.isoformat() if hasattr(dispute.order, 'created_at') else None,
                    "auction": {
                        "item_name": dispute.order.auction.item_name if hasattr(dispute.order, 'auction') else None
                    } if hasattr(dispute, 'order') else {}
                },
                "raised_by": {
                    "email": dispute.raised_by.email if dispute.raised_by else None,
                    "first_name": dispute.raised_by.first_name if dispute.raised_by else None,
                    "last_name": dispute.raised_by.last_name if dispute.raised_by else None,
                    "role": dispute.raised_by.role if hasattr(dispute.raised_by, 'role') else None,
                },
                "against": {
                    "email": dispute.against.email if dispute.against else None,
                    "first_name": dispute.against.first_name if dispute.against else None,
                    "last_name": dispute.against.last_name if dispute.against else None,
                    "role": dispute.against.role if hasattr(dispute.against, 'role') else None,
                },
                "status": dispute.status,
                "reason": getattr(dispute, 'reason', ''),
                "description": getattr(dispute, 'description', ''),
                "created_at": dispute.created_at.isoformat(),
                "resolved_at": dispute.resolved_at.isoformat() if dispute.resolved_at else None,
                "admin_notes": [],
            }
            
            return Response(dispute_data)
        except Dispute.DoesNotExist:
            return Response(
                {"error": "Dispute not found"},
                status=404
            )
        except Exception as e:
            print(f"Dispute detail error: {str(e)}")
            return Response(
                {"error": str(e)},
                status=500
            )
    
    def patch(self, request, pk):
        try:
            dispute = Dispute.objects.get(pk=pk)
            
            if 'status' in request.data:
                dispute.status = request.data['status']
                
            if request.data.get('status') == 'resolved':
                dispute.resolved_at = now()
                
            dispute.save()
            
            return Response({"message": "Dispute updated successfully"})
        except Dispute.DoesNotExist:
            return Response(
                {"error": "Dispute not found"},
                status=404
            )
        except Exception as e:
            print(f"Dispute update error: {str(e)}")
            return Response(
                {"error": str(e)},
                status=500
            )